import { Logger } from "@flxbl-io/sfp-logger";

export interface AlignRepoProps {
    artifactDirectory: string;
    workingDirectory?:string
}

export class AlignImpl {
    constructor(private props: AlignRepoProps, private logger?: Logger) {
      
    }

    async align()
    {
      //Convert to SFPPacakge
      
    }


}
