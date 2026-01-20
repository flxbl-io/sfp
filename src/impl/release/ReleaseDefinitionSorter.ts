import { Logger, LoggerLevel } from '@flxbl-io/sfp-logger';
import SfpPackageInquirer from '../../core/package/SfpPackageInquirer';
import ProjectConfig from '../../core/project/ProjectConfig';
import ArtifactFetcher, { Artifact } from '../../core/artifacts/ArtifactFetcher';
import SfpPackage from '../../core/package/SfpPackage';
import SfpPackageBuilder from '../../core/package/SfpPackageBuilder';
import ReleaseDefinition from './ReleaseDefinition';
import TransitiveDependencyResolver from '../../core/package/dependencies/TransitiveDependencyResolver';
import _ from 'lodash';

export default class ReleaseDefinitionSorter {

    public async sortReleaseDefinitions(
        releaseDefinitions: ReleaseDefinition[],
        leadingSfProjectConfig: any,
        logger: Logger
    ): Promise<ReleaseDefinition[]> {
        const clonedReleaseDefintions: ReleaseDefinition[] = _.cloneDeep(releaseDefinitions);

        try {
            // Try dependency-aware sorting
            const resolver = new TransitiveDependencyResolver(leadingSfProjectConfig, logger);
            const resolvedDependencies = await resolver.resolveTransitiveDependencies();

            // Build release dependency graph and check if dependencies exist
            const releaseDeps = this.buildReleaseDependencyGraph(clonedReleaseDefintions, resolvedDependencies);
            const hasDependencies = Array.from(releaseDeps.values()).some(deps => deps.size > 0);

            if (hasDependencies) {
                const sorted = this.topologicalSortReleases(releaseDeps, clonedReleaseDefintions);
                logger.log(`Dependency-aware order: ${sorted.map(rel => rel.release).join(' -> ')}`, LoggerLevel.INFO);
                return sorted;
            }

            logger.log(`No inter-release dependencies found, using original sorting logic`, LoggerLevel.INFO);
        } catch (error) {
            logger.log(`Dependency sort failed, using original logic: ${error.message}`, LoggerLevel.WARN);
        }

        // Fallback to original logic
        return this.sortByFirstUniquePackage(clonedReleaseDefintions, leadingSfProjectConfig, logger);
    }

    private buildReleaseDependencyGraph(
        releaseDefinitions: ReleaseDefinition[],
        resolvedDependencies: Map<string, { package: string; versionNumber?: string }[]>
    ): Map<string, Set<string>> {
        const releaseDeps = new Map<string, Set<string>>();

        releaseDefinitions.forEach(release => {
            const dependencies = new Set<string>();

            Object.keys(release.artifacts).forEach(pkg => {
                (resolvedDependencies.get(pkg) || []).forEach(dep => {
                    const dependentRelease = releaseDefinitions.find(rel =>
                        Object.keys(rel.artifacts).includes(dep.package) && rel.release !== release.release
                    );
                    if (dependentRelease) dependencies.add(dependentRelease.release);
                });
            });

            releaseDeps.set(release.release, dependencies);
        });

        return releaseDeps;
    }

    private sortByFirstUniquePackage(
        releaseDefinitions: ReleaseDefinition[],
        leadingSfProjectConfig: any,
        logger: Logger
    ): ReleaseDefinition[] {
        const allPackagesInConfig = ProjectConfig.getAllPackagesFromProjectConfig(leadingSfProjectConfig);
        const packageOccurrenceCount = new Map<string, number>();

        // Count occurrences of each package across all release definitions
        releaseDefinitions.forEach((releaseDefinition) => {
            Object.keys(releaseDefinition.artifacts).forEach((pkg) => {
                if (allPackagesInConfig.includes(pkg)) {
                    // Only consider packages present in the project config
                    packageOccurrenceCount.set(pkg, (packageOccurrenceCount.get(pkg) || 0) + 1);
                }
            });
        });

        // Annotate each release definition with the index of its first unique package
        releaseDefinitions.forEach((releaseDefinition) => {
            releaseDefinition['firstUniquePackageIndex'] = allPackagesInConfig.length; // Default to length (i.e., end) if no unique package is found
            for (const pkg of allPackagesInConfig) {
                if (releaseDefinition.artifacts[pkg] && packageOccurrenceCount.get(pkg) === 1) {
                    // Check if the package is unique
                    releaseDefinition['firstUniquePackageIndex'] = allPackagesInConfig.indexOf(pkg);
                    break; // Found the first unique package, no need to continue
                }
            }
        });

        // Sort based on the first unique package's index, placing those without a unique package at the end
        return releaseDefinitions.sort((a, b) => a['firstUniquePackageIndex'] - b['firstUniquePackageIndex']);
    }

    private topologicalSortReleases(
        releaseDefinitionDeps: Map<string, Set<string>>,
        releaseDefinitions: ReleaseDefinition[]
    ): ReleaseDefinition[] {
        const visited = new Set<string>();
        const result: ReleaseDefinition[] = [];
        const releaseMap = new Map<string, ReleaseDefinition>();

        releaseDefinitions.forEach(rel => releaseMap.set(rel.release, rel));

        const visit = (releaseName: string) => {
            if (!visited.has(releaseName)) {
                visited.add(releaseName);
                const dependencies = releaseDefinitionDeps.get(releaseName) || new Set();
                dependencies.forEach(dep => visit(dep));

                const releaseDefinition = releaseMap.get(releaseName);
                if (releaseDefinition) {
                    result.push(releaseDefinition);
                }
            }
        };

        releaseDefinitions.forEach(rel => visit(rel.release));

        return result;
    }
}
