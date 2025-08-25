export type PackageInstallationResult = {
    result: PackageInstallationStatus;
    deploy_id?: string;
    message?: string;
    elapsedTime?:number;
    isPreScriptExecutionSuceeded?: boolean;
    isPostScriptExecutionSuceeeded?:boolean;
    numberOfComponentsDeployed?:number;
    errorType?: ErrorType;
};

export enum PackageInstallationStatus {
    Skipped,
    Succeeded,
    Failed,
}

export enum ErrorType {
    NetworkError,
    ValidationError,
    ConfigurationError,
    BackgroundJobError,
    UnknownError,
}
