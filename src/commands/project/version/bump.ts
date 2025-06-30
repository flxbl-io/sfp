import SfpCommand from '../../../SfpCommand';
import ProjectConfig from '../../../core/project/ProjectConfig';
import Git from '../../../core/git/Git';
import SFPLogger, {
    ConsoleLogger,
    Logger,
    LoggerLevel,
    COLOR_INFO,
    COLOR_SUCCESS,
    COLOR_KEY_MESSAGE,
    COLOR_WARNING,
    COLOR_HEADER,
    COLOR_ERROR,
} from '@flxbl-io/sfp-logger';
import { Flags } from '@oclif/core';
import { loglevel, logsgroupsymbol } from '../../../flags/sfdxflags';

import semver, { ReleaseType } from 'semver';
import chalk from 'chalk';

import Table from 'cli-table';
import { ZERO_BORDER_TABLE } from '../../../core/display/TableConstants';
import fs from 'fs-extra';
import SFPOrg from '../../../core/org/SFPOrg';

const NEXT_SUFFIX = '.NEXT';
const LATEST_SUFFIX = '.LATEST';

type CustomReleaseType = semver.ReleaseType | 'custom';

class VersionedPackage {
    packageName: string;
    packageId: string;
    path: string;

    currentVersion: string;
    newVersion: string = null;

    dependencies: VersionedPackage[] = [];

    constructor({
        package: packageName,
        versionNumber,
        dependencies,
        path,
    }: {
        package: string;
        versionNumber?: string;
        dependencies?: { package: string; versionNumber: string }[];
        path?: string;
    }) {
        this.packageName = packageName;
        this.currentVersion = versionNumber;
        this.path = path;

        if (dependencies) {
            this.setDependencies(dependencies);
        }
    }

    public increment(versionType: CustomReleaseType = 'patch', customVersion: string = null): void {
        if (versionType === 'custom') {
            this.updateVersion(customVersion);
        }

        this.updateVersion(semver.inc(this.cleanedVersion(), versionType as ReleaseType));
    }

    public updateVersion(version: string): void {
        // semver.coerce() throw an error if the version is invalid
        try {
            semver.coerce(version);
        } catch (error) {
            SFPLogger.log(COLOR_ERROR(`Cannot update with invalid version number: ${version}`), LoggerLevel.ERROR);
            process.exit(1);
        }

        if (this.isUpdated) {
            return;
        }

        this.newVersion = version + this.getSuffix();
    }

    get isUpdated() {
        return this.newVersion !== null;
    }

    getSuffix(): string {
        if (this.currentVersion.includes(NEXT_SUFFIX)) {
            return NEXT_SUFFIX;
        }

        if (this.currentVersion.includes(LATEST_SUFFIX)) {
            return LATEST_SUFFIX;
        }

        return '.0';
    }

    /**
     * Remove any suffixes and build numbers from the version number
     * @returns cleaned version number without suffixes
     */
    public versionByParts(rawVersion: string = this.currentVersion): string[] {
        return rawVersion.split('.').slice(0, 3);
    }

    public cleanedVersion(version: string = this.currentVersion): string {
        return this.versionByParts(version).join('.');
    }

    public setDependencies(dependencies: { package: string; versionNumber?: string }[]): void {
        dependencies.forEach((dep) => {
            this.setDependency(dep);
        });
    }

    public setDependency(dependency: { package: string; versionNumber?: string }): void {
        this.dependencies.push(new VersionedPackage(dependency));
    }

    public hasDependency(pkg: VersionedPackage): boolean {
        return this.getDependency(pkg) !== null;
    }

    public getDependency(pkg: VersionedPackage): VersionedPackage | null {
        if (!this.dependencies || this.dependencies.length === 0) {
            return null;
        }

        let dependency = this.dependencies.find((dep) => dep.packageName === pkg.packageName);

        return dependency ? dependency : null;
    }

    public updateDependency(parentPackage: VersionedPackage): VersionedPackage | null {
        let dependency = this.getDependency(parentPackage);

        if (dependency === null || dependency.isUpdated) {
            return null;
        }

        dependency.updateVersion(this.cleanedVersion(parentPackage.newVersion));
        return dependency;
    }

    public print(highlightFn = chalk.yellow.bold): string {
        if (!this.isUpdated) {
            return `${this.cleanedVersion()}`;
        }

        const oldParts = this.versionByParts();
        const newParts = this.versionByParts(this.newVersion);

        let formattedOld: string = oldParts
            .map((part, index) => {
                return part !== newParts[index] ? highlightFn(part) : part;
            })
            .join('.');
        let formattedNew: string = this.versionByParts(this.newVersion)
            .map((part, index) => {
                return part === oldParts[index] ? part : highlightFn(part);
            })
            .join('.');

        return `${formattedOld} -> ${formattedNew}`;
    }

    public write(): any {
        let output: {
            package: string;
            versionNumber?: string;
            dependencies?: any;
        } = { package: this.packageName };

        if (this.currentVersion === null || this.currentVersion === undefined) {
            return output;
        }

        output.versionNumber = this.currentVersion;

        if (this.isUpdated) {
            output.versionNumber = this.newVersion;
        }

        if (this.dependencies.length > 0) {
            output.dependencies = this.dependencies.map((dep) => dep.write());
        }

        return output;
    }
}

export default class VersionUpdater extends SfpCommand {
    public static flags = {
        package: Flags.string({
            char: 'p',
            description: 'Specify the package to increment',
            required: false,
        }),
        all: Flags.boolean({
            char: 'a',
            description: 'Increment all package versions',
            required: false,
        }),
        targetref: Flags.string({
            char: 'r',
            description: 'Specify the git reference for diff comparison',
            required: false,
        }),
        targetorg: Flags.string({
            char: 'o',
            description: 'Specify the target org for diff comparison',
            required: false,
        }),
        patch: Flags.boolean({
            description: 'Increment patch number (default)',
            required: false,
        }),
        minor: Flags.boolean({
            char: 'm',
            description: 'Increment minor number',
            required: false,
        }),
        major: Flags.boolean({
            char: 'M',
            description: 'Increment major number',
            required: false,
        }),
        versionnumber: Flags.string({
            char: 'v',
            description: 'Set a custom version number',
            required: false,
        }),
        deps: Flags.boolean({
            description: 'Update direct dependencies',
            required: false,
        }),
        dryrun: Flags.boolean({
            description: 'Do not save changes to sfdx-project.json',
            required: false,
            default: false,
        }),
        json: Flags.boolean({
            description: 'Output JSON report',
            required: false,
            default: false,
        }),
        logsgroupsymbol,
        loglevel,
    };

    projectData: any;
    projectPackages: Map<string, VersionedPackage>;

    diffChecker: PackageUpdater;

    async execute(): Promise<any> {
        let logger: Logger = new ConsoleLogger();

        // SFPLogger.log(COLOR_HEADER(`Target Ref: ${this.flags.targetorg}`), LoggerLevel.INFO, logger);
        // SFPLogger.printHeaderLine('', COLOR_HEADER, LoggerLevel.INFO);

        this.loadProjectData();
        await this.updateVersions();

        if (!this.flags.dryRun) {
            await this.save();
        }
    }

    getVersionType(): CustomReleaseType {
        if (this.flags.minor) {
            return 'minor';
        }

        if (this.flags.major) {
            return 'major';
        }

        if (this.flags.versionnumber) {
            return 'custom';
        }

        return 'patch';
    }

    loadProjectData() {
        this.projectData = ProjectConfig.getSFDXProjectConfig(null);

        this.projectPackages = new Map(
            this.projectData.packageDirectories.map(
                (pkg: {
                    package: string;
                    versionNumber: string;
                    dependencies?: { package: string; versionNumber: string }[];
                    path?: string;
                }) => [pkg.package, new VersionedPackage(pkg)]
            )
        );
    }

    private async updateVersions(): Promise<VersionedPackage[]> {
        const updatedPackages = await this.getDiffChecker().getUpdatedPackages(
            this.getVersionType(),
            this.flags.versionnumber
        );

        const updatedDependencies = this.updateDependencies(updatedPackages, { deps: this.flags.deps });

        let report = new ReportGenerator(updatedPackages, updatedDependencies);

        if (this.flags.json) {
            report.setFormat('json');
        }

        report.printReport();

        return updatedPackages;
    }

    public getDiffChecker(): PackageUpdater {
        let diffChecker: PackageUpdater = null;

        if (this.flags.targetref) {
            diffChecker = new GitDiff(this.flags.targetref, Array.from(this.projectPackages.values()));
        } else if (this.flags.targetorg) {
            diffChecker = new OrgDiff(this.flags.targetorg, Array.from(this.projectPackages.values()));
        } else if (this.flags.package) {
            diffChecker = new SinglePackageUpdate(this.flags.package, Array.from(this.projectPackages.values()));
        } else if (this.flags.all) {
            diffChecker = new AllPackageUpdate(Array.from(this.projectPackages.values()));
        }

        if (!diffChecker) {
            SFPLogger.log(COLOR_ERROR('Please specify --package, --all, or --target-ref.'), LoggerLevel.ERROR);
            process.exit(1);
        }

        return diffChecker;
    }

    // Get package by name
    public getPackage(packageName: string): VersionedPackage {
        return this.projectPackages.get(packageName);
    }

    /**
     * Update dependencies based on updated packages
     * 
     * @param updatedPackages List of updated packages
     * @param options Options for updating dependencies - deps: increment dependent packages
     */
    public updateDependencies(updatedPackages: VersionedPackage[], options = { incrementDependant: false }): VersionedPackage[] {
        let updatedDependencies: VersionedPackage[] = [];

        for (const updatedPackage of updatedPackages) {
            this.projectPackages.forEach((projectPackage) => {
                let dependency = projectPackage.updateDependency(updatedPackage);

                if (dependency === null) {
                    return;
                }

                if (options.incrementDependant) {
                    projectPackage.increment();
                }

                updatedDependencies.push(projectPackage);
            });
        }

        return updatedDependencies;
    }

    public async save() {
        const projectPackages = Array.from(this.projectPackages.values());

        this.projectData.packageDirectories = this.projectData.packageDirectories.map((pkg) => {
            const updatedPkg = projectPackages.find((projectPackage) => projectPackage.packageName === pkg.package);
            return updatedPkg ? { ...pkg, ...updatedPkg.write() } : pkg;
        });

        const projectConfigPath = 'sfdx-project.json';
        fs.writeFileSync(projectConfigPath, JSON.stringify(this.projectData, null, 2));

        SFPLogger.log(COLOR_SUCCESS(`\nsfdx-project.json updated successfully!\n`), LoggerLevel.INFO);
    }
}

interface PackageUpdater {
    getUpdatedPackages(versionType: CustomReleaseType, versionNumber?: string): Promise<VersionedPackage[]>;
}

class GitDiff implements PackageUpdater {
    targetRef: string;
    projectPackages: VersionedPackage[];

    constructor(targetRef: string, projectPackages: VersionedPackage[]) {
        this.targetRef = targetRef;
        this.projectPackages = projectPackages;
    }

    async getUpdatedPackages(versionType: CustomReleaseType, versionNumber?: string): Promise<VersionedPackage[]> {
        try {
            let git: Git = await Git.initiateRepo();
            const changedFiles = await git.diff(['--name-only', this.targetRef]);

            const updatedPackages: VersionedPackage[] = this.projectPackages.filter((pkg) =>
                changedFiles.some((file) => file.startsWith(pkg.path.replace(/^\.\//, '')))
            );

            updatedPackages.forEach((pkg) => {
                pkg.increment(versionType, versionNumber);
            });

            SFPLogger.log(
                COLOR_INFO(`\nPackages updated based on git diff against `) + chalk.yellow.bold(`${this.targetRef}:`),
                LoggerLevel.INFO
            );
            return updatedPackages;
        } catch (error) {
            SFPLogger.log(COLOR_ERROR(`Error running git diff: ${error.message}`), LoggerLevel.ERROR);
            process.exit(1);
        }
    }
}

class OrgDiff implements PackageUpdater {
    targetOrg: string;
    projectPackages: VersionedPackage[];

    constructor(targetOrg: string, projectPackages: VersionedPackage[]) {
        this.targetOrg = targetOrg;
        this.projectPackages = projectPackages;
    }

    /**
     * Check
     */
    async getUpdatedPackages(versionType: CustomReleaseType, versionNumber?: string): Promise<VersionedPackage[]> {
        try {
            const org = await SFPOrg.create({ aliasOrUsername: this.targetOrg });
            const installedPackages = await org.getAllInstalledArtifacts();

            const updatedPackages = this.projectPackages
                .map((pkg) => {
                    const installedPkg = installedPackages.find(
                        (installedPkg) =>
                            installedPkg.name === pkg.packageName &&
                            semver.lte(semver.coerce(pkg.currentVersion), semver.coerce(installedPkg.version))
                    );

                    if (installedPkg) {
                        pkg.updateVersion(
                            semver.inc(pkg.cleanedVersion(installedPkg.version), versionType as ReleaseType)
                        );
                    }

                    return pkg;
                })
                .filter((pkg) => pkg.isUpdated);

            SFPLogger.log(
                COLOR_INFO(`\nPackages updated based on org diff against `) + chalk.yellow.bold(`${this.targetOrg}`),
                LoggerLevel.INFO
            );
            return updatedPackages;
        } catch (error) {
            SFPLogger.log(COLOR_ERROR(`Error running org diff: ${error.message}`), LoggerLevel.ERROR);
            process.exit(1);
        }
    }
}

class SinglePackageUpdate implements PackageUpdater {
    packageName: string;
    projectPackages: VersionedPackage[];

    constructor(packageName: string, projectPackages: VersionedPackage[]) {
        this.packageName = packageName;
        this.projectPackages = projectPackages;
    }

    async getUpdatedPackages(versionType: CustomReleaseType, versionNumber?: string): Promise<VersionedPackage[]> {
        const pkg = this.projectPackages.find((pkg) => pkg.packageName === this.packageName);
        if (!pkg) {
            SFPLogger.log(COLOR_ERROR(`Package ${this.packageName} not found in sfdx-project.json`), LoggerLevel.ERROR);
            process.exit(1);
        }

        pkg.increment(versionType, versionNumber);
        return [pkg];
    }
}

class AllPackageUpdate implements PackageUpdater {
    projectPackages: VersionedPackage[];

    constructor(projectPackages: VersionedPackage[]) {
        this.projectPackages = projectPackages;
    }

    async getUpdatedPackages(versionType: CustomReleaseType, versionNumber?: string): Promise<VersionedPackage[]> {
        return this.projectPackages.map((pkg) => {
            pkg.increment(versionType, versionNumber);
            return pkg;
        });
    }
}

class ReportGenerator {
    format: string = 'human';
    updatedPackages: VersionedPackage[] = [];
    updatedDependencies: VersionedPackage[] = [];

    _arrow: string = '⮑';

    table: Table;
    dependenciesTable: Table;

    constructor(updatedPackages: VersionedPackage[] = [], updatedDependencies: VersionedPackage[] = []) {
        this.setUpdatedPackages(updatedPackages);
        this.setUpdatedDependencies(updatedDependencies);
    }

    public setUpdatedPackages(updatedPackages: VersionedPackage[]) {
        this.updatedPackages = updatedPackages;
    }

    public setUpdatedDependencies(updatedDependencies: VersionedPackage[]) {
        this.updatedDependencies = updatedDependencies;
    }

    public setFormat(format: string) {
        this.format = format;
    }

    public printUpdatedPackages(): void {
        SFPLogger.log(COLOR_KEY_MESSAGE(`\nPackage versions updated:`), LoggerLevel.INFO);
        this.updatedPackages.forEach((pkg) => {
            this.table.push([pkg.packageName, ...pkg.print().split(' ')]);
        });

        SFPLogger.log(this.table.toString(), LoggerLevel.INFO);
    }

    public printUpdatedDependencies(): void {
        if (this.updatedDependencies.length <= 0) {
            return;
        }

        SFPLogger.log(COLOR_KEY_MESSAGE(`\nDependencies updated:`), LoggerLevel.INFO);

        this.updatedDependencies.forEach((pkg) => {
            this.dependenciesTable.push([pkg.packageName, ...pkg.print().split(' ')]);

            pkg.dependencies.forEach((dependency) => {
                if (!dependency.isUpdated) {
                    return;
                }

                this.dependenciesTable.push(
                    [
                        ` ${this._arrow}  ${dependency.packageName}`,
                        ...dependency.print(chalk.cyan.yellow).split(' '),
                    ].map((value) => chalk.dim(value))
                );
            });
        });
        SFPLogger.log(this.dependenciesTable.toString(), LoggerLevel.INFO);
    }

    public printReport() {
        if (this.format === 'json') {
            this.printJSONReport();
        } else {
            this.printHumanReport();
        }
    }

    private printHumanReport() {
        this.table = new Table({
            head: ['Package', 'Version', '', ''],
            chars: ZERO_BORDER_TABLE,
        });

        this.dependenciesTable = new Table({
            head: ['Package', 'Version', '', ''],
            chars: ZERO_BORDER_TABLE,
        });

        this.printUpdatedPackages();
        this.printUpdatedDependencies();
    }

    private printJSONReport() {
        let report = {
            packages: this.updatedPackages.map((pkg) => pkg.write()),
            dependencies: this.updatedDependencies.map((pkg) => pkg.write()),
        };

        SFPLogger.log(COLOR_INFO(JSON.stringify(report, null, 2)), LoggerLevel.INFO);
    }
}
