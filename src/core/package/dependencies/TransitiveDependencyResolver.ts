import ProjectConfig from '../../project/ProjectConfig';
import { COLOR_HEADER, COLOR_KEY_MESSAGE, COLOR_SUCCESS, COLOR_ERROR } from '@flxbl-io/sfp-logger';
import SFPLogger, { LoggerLevel, Logger } from '@flxbl-io/sfp-logger';
import _ from 'lodash';
import UserDefinedExternalDependencyMap from '../../project/UserDefinedExternalDependency';
import semver from 'semver';

export interface DependencyDetail {
    version: string;
    isDirect: boolean;
    contributors: string[];
}

export interface DependencyResolutionDetails {
    resolvedDependencies: Map<string, { package: string; versionNumber?: string }[]>;
    details: Map<string, { [dependencyName: string]: DependencyDetail }>;
}

export default class TransitiveDependencyResolver {
    constructor(private sfdxProjectConfig: any, private logger?: Logger) {}

    public async resolveTransitiveDependencies(): Promise<Map<string, { package: string; versionNumber?: string }[]>> {
        const result = await this.resolveTransitiveDependenciesWithDetails();
        return result.resolvedDependencies;
    }

    public async resolveTransitiveDependenciesWithDetails(): Promise<DependencyResolutionDetails> {
        SFPLogger.log('Validating Project Dependencies...', LoggerLevel.INFO, this.logger);

        let clonedProjectConfig = await _.cloneDeep(this.sfdxProjectConfig);
        clonedProjectConfig = await new UserDefinedExternalDependencyMap().cleanupEntries(clonedProjectConfig);
        let pkgWithDependencies = ProjectConfig.getAllPackagesAndItsDependencies(clonedProjectConfig);
        pkgWithDependencies = this.fillDepsWithUserDefinedExternalDependencyMap(
            pkgWithDependencies,
            new UserDefinedExternalDependencyMap().fetchDependencyEntries(clonedProjectConfig)
        );

        // Track version contributors during resolution
        const versionContributors = new Map<string, Map<string, Set<string>>>();
        const originalDeps = new Map(pkgWithDependencies);
        pkgWithDependencies = this.fillDepsTransitively(pkgWithDependencies, versionContributors);
        let sortedPackages = this.topologicalSort(pkgWithDependencies);
        let sortedPkgWithDependencies = new Map<string, { package: string; versionNumber?: string }[]>();

        sortedPackages.forEach(pkg => {
            let dependencies = pkgWithDependencies.get(pkg) || [];
            let uniqueDependencies = new Map<string, { package: string; versionNumber?: string }>();
            dependencies.forEach(dep => {
                const existing = uniqueDependencies.get(dep.package);
                if (!existing || this.compareVersions(dep.versionNumber, existing.versionNumber) > 0) {
                    uniqueDependencies.set(dep.package, dep);
                }
            });
            let sortedDependencies = Array.from(uniqueDependencies.values())
                .sort((a, b) => sortedPackages.indexOf(a.package) - sortedPackages.indexOf(b.package));
            sortedPkgWithDependencies.set(pkg, sortedDependencies);
        });

        // Generate and log dependency details
        const details = this.generateDependencyDetails(
            sortedPackages,
            sortedPkgWithDependencies,
            originalDeps,
            versionContributors
        );

        return {
            resolvedDependencies: sortedPkgWithDependencies,
            details
        };
    }

    private compareVersions(version1?: string, version2?: string): number {
        if (!version1 && !version2) return 0;
        if (!version1) return -1;
        if (!version2) return 1;

        // Handle LATEST/NEXT suffixes
        const v1HasLatest = version1.endsWith('.LATEST');
        const v2HasLatest = version2.endsWith('.LATEST');
        const v1HasNext = version1.endsWith('.NEXT');
        const v2HasNext = version2.endsWith('.NEXT');

        // If one has LATEST and other doesn't, LATEST wins
        if ((v1HasLatest || v1HasNext) && !v2HasLatest && !v2HasNext) return 1;
        if ((v2HasLatest || v2HasNext) && !v1HasLatest && !v1HasNext) return -1;

        // Extract base version (removing LATEST/NEXT if present)
        const v1Base = version1.replace(/\.(LATEST|NEXT)$/, '');
        const v2Base = version2.replace(/\.(LATEST|NEXT)$/, '');

        // Split into version parts
        const v1Parts = v1Base.split('.');
        const v2Parts = v2Base.split('.');

        // Compare first three parts using semver
        const v1Semver = v1Parts.slice(0, 3).join('.');
        const v2Semver = v2Parts.slice(0, 3).join('.');
        
        const semverCompare = semver.compare(
            semver.coerce(v1Semver) || '0.0.0',
            semver.coerce(v2Semver) || '0.0.0'
        );

        if (semverCompare !== 0) return semverCompare;

        // If semver parts are equal, compare build numbers (4th part)
        const buildNum1 = parseInt(v1Parts[3] || '0');
        const buildNum2 = parseInt(v2Parts[3] || '0');
        
        return buildNum1 - buildNum2;
    }

    private fillDepsWithUserDefinedExternalDependencyMap(
        pkgWithDependencies: Map<string, { package: string; versionNumber?: string }[]>,
        externalDependencyMap: any
    ): Map<string, { package: string; versionNumber?: string }[]> {
        if (externalDependencyMap) {
            for (let pkg of Object.keys(externalDependencyMap)) {
                pkgWithDependencies.set(pkg, externalDependencyMap[pkg]);
            }
        }
        return pkgWithDependencies;
    }

    private generateDependencyDetails(
        sortedPackages: string[],
        resolvedDeps: Map<string, { package: string; versionNumber?: string }[]>,
        originalDeps: Map<string, { package: string; versionNumber?: string }[]>,
        versionContributors: Map<string, Map<string, Set<string>>>
    ): Map<string, { [dependencyName: string]: DependencyDetail }> {
        const details = new Map<string, { [dependencyName: string]: DependencyDetail }>();

        sortedPackages.forEach(pkg => {
            const dependencies = resolvedDeps.get(pkg) || [];
            
            if (dependencies.length > 0) {
                SFPLogger.log(
                    COLOR_HEADER(`\nPackage: ${pkg}`),
                    LoggerLevel.INFO,
                    this.logger
                );
                SFPLogger.log(
                    COLOR_HEADER('----------------------------------------'),
                    LoggerLevel.INFO,
                    this.logger
                );
                SFPLogger.log(COLOR_HEADER('Dependencies:'), LoggerLevel.INFO, this.logger);

                const pkgDetails: { [dependencyName: string]: DependencyDetail } = {};
                
                dependencies.forEach(dep => {
                    const isDirect = originalDeps.get(pkg)?.some(d => 
                        d.package === dep.package && d.versionNumber === dep.versionNumber
                    ) || false;

                    const contributorsSet = versionContributors.get(dep.package)?.get(dep.versionNumber || '') || new Set<string>();
                    const contributors = Array.from(contributorsSet);
                    
                    let message = `${dep.package}@${dep.versionNumber || 'unknown'}`;
                    if (isDirect) {
                        message += ' (direct dependency)';
                    } else if (contributors.length > 0) {
                        message += ` (via ${contributors.join(', ')})`;
                    }
                    
                    SFPLogger.log(
                        COLOR_KEY_MESSAGE(`  ${message}`),
                        LoggerLevel.INFO,
                        this.logger
                    );

                    pkgDetails[dep.package] = {
                        version: dep.versionNumber || 'unknown',
                        isDirect,
                        contributors
                    };
                });

                details.set(pkg, pkgDetails);
            }
        });

        return details;
    }

    private fillDepsTransitively(
        pkgWithDependencies: Map<string, { package: string; versionNumber?: string }[]>,
        versionContributors: Map<string, Map<string, Set<string>>>
    ): Map<string, { package: string; versionNumber?: string }[]> {
        let dependencyMap = new Map(pkgWithDependencies);
        
        const resolveDependencies = (pkg: string, chain: Set<string> = new Set()): { package: string; versionNumber?: string }[] => {
            SFPLogger.log(
                COLOR_HEADER(`fetching dependencies for package:`) + COLOR_KEY_MESSAGE(pkg),
                LoggerLevel.TRACE,
                this.logger
            );

            if (chain.has(pkg)) {
                const circularChain = Array.from(chain).join(' -> ');
                const errorMessage = `Circular dependency detected: ${circularChain} -> ${pkg}. Salesforce does not support circular dependencies between packages.`;
                SFPLogger.log(
                    COLOR_ERROR(errorMessage),
                    LoggerLevel.ERROR,
                    this.logger
                );
                throw new Error(errorMessage);
            }

            chain.add(pkg);
            
            let dependencies = dependencyMap.get(pkg) || [];
            let allDependencies = new Map<string, { package: string; versionNumber?: string }>();
            
            // Add direct dependencies
            dependencies.forEach(dep => {
                const existing = allDependencies.get(dep.package);
                if (!existing || this.compareVersions(dep.versionNumber, existing.versionNumber) > 0) {
                    allDependencies.set(dep.package, dep);
                    
                    // Track version contributor
                    if (!versionContributors.has(dep.package)) {
                        versionContributors.set(dep.package, new Map());
                    }
                    const packageVersions = versionContributors.get(dep.package)!;
                    if (!packageVersions.has(dep.versionNumber || '')) {
                        packageVersions.set(dep.versionNumber || '', new Set());
                    }
                    packageVersions.get(dep.versionNumber || '')!.add(pkg);
                }
            });

            // Add transitive dependencies
            dependencies.forEach(dep => {
                if (dependencyMap.has(dep.package)) {
                    let transitiveDeps = resolveDependencies(dep.package, new Set(chain));
                    transitiveDeps.forEach(td => {
                        const existing = allDependencies.get(td.package);
                        if (!existing || this.compareVersions(td.versionNumber, existing.versionNumber) > 0) {
                            allDependencies.set(td.package, td);
                            
                            // Track version contributor
                            if (!versionContributors.has(td.package)) {
                                versionContributors.set(td.package, new Map());
                            }
                            const packageVersions = versionContributors.get(td.package)!;
                            if (!packageVersions.has(td.versionNumber || '')) {
                                packageVersions.set(td.versionNumber || '', new Set());
                            }
                            packageVersions.get(td.versionNumber || '')!.add(dep.package);
                        }
                    });
                }
            });
            
            chain.delete(pkg);
            return Array.from(allDependencies.values());
        };
    
        for (let pkg of dependencyMap.keys()) {
            let resolvedDeps = resolveDependencies(pkg);
            dependencyMap.set(pkg, resolvedDeps);
        }

        return dependencyMap;
    }

    private swapAndDropArrayElement<T>(arr: T[], i: number, j: number): T[] {
        if (i < 0 || i >= arr.length || j < 0 || j >= arr.length) {
            return arr;
        }
        
        let newArr = [...arr];
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        return [...newArr.slice(0, j), ...newArr.slice(j + 1)];
    }
      
    private topologicalSort(
        pkgWithDependencies: Map<string, { package: string; versionNumber?: string }[]>
    ): string[] {
        let visited = new Set<string>();
        let result: string[] = [];
    
        const visit = (pkg: string) => {
            if (!visited.has(pkg)) {
                visited.add(pkg);
                let dependencies = pkgWithDependencies.get(pkg) || [];
                dependencies.forEach(dep => visit(dep.package));
                result.push(pkg);
            }
        };
    
        for (let pkg of pkgWithDependencies.keys()) {
            visit(pkg);
        }
    
        return result;
    }
}
