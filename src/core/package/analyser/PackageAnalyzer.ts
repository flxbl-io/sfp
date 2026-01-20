import { Logger } from "@flxbl-io/sfp-logger";
import { ComponentSet } from "@salesforce/source-deploy-retrieve";
import SfpPackage from "../SfpPackage";

export interface PackageAnalyzer
{
  getName();
  analyze(sfpPackage: SfpPackage, logger: Logger, componentSet?: ComponentSet): Promise<SfpPackage>
  isEnabled(sfpPackage: SfpPackage,logger:Logger): Promise<boolean> 

  
}