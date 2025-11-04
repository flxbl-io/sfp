import { jest, expect } from '@jest/globals';
import { MockTestOrgData, TestContext } from '../../../../node_modules/@salesforce/core/lib/testSetup';
import { Connection, AuthInfo, OrgConfigProperties, ConfigAggregator } from '@salesforce/core';
import TransitiveDependencyResolver from '../../../../src/core/package/dependencies/TransitiveDependencyResolver';
const $$ =  new TestContext();

const setupFakeConnection = async () => {
  const testData = new MockTestOrgData();
  testData.makeDevHub();
  await $$.stubConfig({ [OrgConfigProperties.TARGET_ORG]: testData.username });
  const { value } = (await ConfigAggregator.create()).getInfo(OrgConfigProperties.TARGET_ORG);
  await $$.stubAuths(testData);
  await $$.stubAliases({ myAlias: testData.username });
  $$.fakeConnectionRequest = (request) => {
    return Promise.resolve(response);
  };

  const conn = await Connection.create({
    authInfo: await AuthInfo.create({username: testData.username})
  });

  return conn;
}

jest.mock('../../../../src/core/git/Git', () => {
  class Git {
    static async initiateRepo()
     {
      return new Git();
     }
  }

  return Git;
});

jest.mock('../../../../src/core/git/GitTags', () => {
  class GitTags {
      async listTagsOnBranch(): Promise<string[]> {
          return gitTags;
      }
  }

  return GitTags;
});

let conn: Connection;
let gitTags;
let response;

describe("Given a TransitiveDependencyResolver", () => {

  beforeEach(async () => {
    conn = await setupFakeConnection();

  })

  it("should resolve missing package dependencies with transitive dependency", async () => {
    const transitiveDependencyResolver = new TransitiveDependencyResolver(projectConfig);
    let resolvedDependencies = await transitiveDependencyResolver.resolveTransitiveDependencies();

    let dependencies =  resolvedDependencies.get('candidate-management');
    expect(dependencies?.find(dependency => dependency.package === "temp")).toBeTruthy();
    expect(dependencies?.find(dependency => dependency.package === "temp")?.versionNumber).toBe("1.0.0.LATEST");
  });

  it("should resolve package dependencies in the same order as its dependent packages", async () => {
    const transitiveDependencyResolver = new TransitiveDependencyResolver(projectConfig);
    const resolvedDependencies = await transitiveDependencyResolver.resolveTransitiveDependencies();
    
    let baseIndex = resolvedDependencies.get('candidate-management')?.findIndex(dependency => dependency.package === "base");
    expect(baseIndex).toBe(0);
    let tempIndex = resolvedDependencies.get('candidate-management')?.findIndex(dependency => dependency.package === "temp");
    expect(tempIndex).toBe(1);
    let coreIndex = resolvedDependencies.get('candidate-management')?.findIndex(dependency => dependency.package === "core");
    expect(coreIndex).toBe(2);
    
  });


  it("should resolve package dependencies with a higher version of a given package if a higher version is specified", async () => {
    const transitiveDependencyResolver = new TransitiveDependencyResolver(projectConfig);
    const resolvedDependencies = await transitiveDependencyResolver.resolveTransitiveDependencies();
    
    let dependencies =  resolvedDependencies.get('quote-management');
    expect(dependencies?.find(dependency => dependency.package === "core")?.versionNumber).toBe("1.2.0.LATEST");
  
  });

  it("should have only one version of a package", async () => {
    const transitiveDependencyResolver = new TransitiveDependencyResolver(projectConfig);
    const resolvedDependencies = await transitiveDependencyResolver.resolveTransitiveDependencies();
    expect(verifyUniquePkgs(resolvedDependencies.get('quote-management'))).toBeTruthy();
  
  });

  it("should expand the dependencies of external packages", async () => {
    const transitiveDependencyResolver = new TransitiveDependencyResolver(projectConfig);
    const resolvedDependencies = await transitiveDependencyResolver.resolveTransitiveDependencies();
    let externalDependencyIndex = resolvedDependencies.get('contact-management')?.findIndex(dependency => dependency.package === "sfdc-framework");
    expect(externalDependencyIndex).toBe(3);

  });

  it("should resolve with a higher version of a given package if a higher version is specified", async () => {
    // Setup project config with three packages and their dependencies
    const complexProjectConfig = {
      packageDirectories: [
        {
          package: "package-a",
          versionNumber: "1.1.0.NEXT",
          dependencies: []
        },
        {
          package: "package-b",
          versionNumber: "2.0.0.NEXT",
          dependencies: [
            {
              package: "package-a",
              versionNumber: "1.0.0.LATEST"
            }
          ]
        },
        {
          package: "package-c",
          versionNumber: "1.0.0.NEXT",
          dependencies: [
            {
              package: "package-b",
              versionNumber: "2.0.0.LATEST"
            },
            {
              package: "package-a",
              versionNumber: "1.1.0.LATEST"
            }
          ]
        }
      ]
    };

    const transitiveDependencyResolver = new TransitiveDependencyResolver(complexProjectConfig);
    const resolvedDependencies = await transitiveDependencyResolver.resolveTransitiveDependencies();
    
    // Get dependencies for package-c
    const packageCDeps = resolvedDependencies.get('package-c');
    
    // Verify package-a appears only once and with the higher version
    const packageADeps = packageCDeps?.filter(dep => dep.package === 'package-a');
    expect(packageADeps?.length).toBe(1);
    expect(packageADeps?.[0].versionNumber).toBe('1.1.0.LATEST');
    
    // Verify package-b is included
    const packageBDep = packageCDeps?.find(dep => dep.package === 'package-b');
    expect(packageBDep).toBeTruthy();
    expect(packageBDep?.versionNumber).toBe('2.0.0.LATEST');
    
    // Verify the order: package-a should come before package-b due to dependency chain
    const packageAIndex = packageCDeps?.findIndex(dep => dep.package === 'package-a');
    const packageBIndex = packageCDeps?.findIndex(dep => dep.package === 'package-b');
    expect(packageAIndex).toBeLessThan(packageBIndex!);
  });

  it("should handle build number versions correctly", async () => {
    const buildNumberConfig = {
      packageDirectories: [
        {
          package: "package-a",
          versionNumber: "1.0.0.5",
          dependencies: []
        },
        {
          package: "package-b",
          versionNumber: "1.0.0.NEXT",
          dependencies: [
            {
              package: "package-a",
              versionNumber: "1.0.0.3"
            }
          ]
        }
      ]
    };

    const resolver = new TransitiveDependencyResolver(buildNumberConfig);
    const resolvedDeps = await resolver.resolveTransitiveDependencies();
    const packageBDeps = resolvedDeps.get('package-b');
    
    // Should use the higher build number
    const packageADep = packageBDeps?.find(dep => dep.package === 'package-a');
    expect(packageADep?.versionNumber).toBe('1.0.0.3');
  });

  it("should handle missing version numbers gracefully", async () => {
    const missingVersionConfig = {
      packageDirectories: [
        {
          package: "package-a",
          versionNumber: "1.0.0.NEXT",
          dependencies: []
        },
        {
          package: "package-b",
          versionNumber: "1.0.0.NEXT",
          dependencies: [
            {
              package: "package-a"
              // No version number specified
            }
          ]
        }
      ]
    };

    const resolver = new TransitiveDependencyResolver(missingVersionConfig);
    const resolvedDeps = await resolver.resolveTransitiveDependencies();
    const packageBDeps = resolvedDeps.get('package-b');
    
    // Should not throw and should include the dependency
    expect(packageBDeps?.find(dep => dep.package === 'package-a')).toBeTruthy();
  });

  it("should respect specified dependency versions", async () => {
    const buildNumberConfig = {
      packageDirectories: [
        {
          package: "package-a",
          versionNumber: "1.0.0.5",  // Package A is on version 5
          dependencies: []
        },
        {
          package: "package-b",
          versionNumber: "1.0.0.NEXT",
          dependencies: [
            {
              package: "package-a",
              versionNumber: "1.0.0.3"  // But package B depends on version 3
            }
          ]
        }
      ]
    };

    const resolver = new TransitiveDependencyResolver(buildNumberConfig);
    const resolvedDeps = await resolver.resolveTransitiveDependencies();
    const packageBDeps = resolvedDeps.get('package-b');
    
    // Should use the specified dependency version
    const packageADep = packageBDeps?.find(dep => dep.package === 'package-a');
    expect(packageADep?.versionNumber).toBe('1.0.0.3');
  });

  it("should throw error on circular dependencies", async () => {
    const circularConfig = {
      packageDirectories: [
        {
          package: "package-a",
          versionNumber: "1.0.0.NEXT",
          dependencies: [
            {
              package: "package-b",
              versionNumber: "1.0.0.LATEST"
            }
          ]
        },
        {
          package: "package-b",
          versionNumber: "1.0.0.NEXT",
          dependencies: [
            {
              package: "package-a",
              versionNumber: "1.0.0.LATEST"
            }
          ]
        }
      ]
    };

    const resolver = new TransitiveDependencyResolver(circularConfig);
    
    // Should throw error due to circular dependency
    await expect(resolver.resolveTransitiveDependencies()).rejects.toThrow(/Circular dependency detected.*package-a -> package-b -> package-a/);
  });

  it("should handle deep transitive dependencies", async () => {
    const deepConfig = {
      packageDirectories: [
        {
          package: "package-a",
          versionNumber: "1.0.0.NEXT",
          dependencies: []
        },
        {
          package: "package-b",
          versionNumber: "1.0.0.NEXT",
          dependencies: [
            {
              package: "package-a",
              versionNumber: "1.0.0.LATEST"
            }
          ]
        },
        {
          package: "package-c",
          versionNumber: "1.0.0.NEXT",
          dependencies: [
            {
              package: "package-b",
              versionNumber: "1.0.0.LATEST"
            }
          ]
        },
        {
          package: "package-d",
          versionNumber: "1.0.0.NEXT",
          dependencies: [
            {
              package: "package-c",
              versionNumber: "1.0.0.LATEST"
            }
          ]
        }
      ]
    };

    const resolver = new TransitiveDependencyResolver(deepConfig);
    const resolvedDeps = await resolver.resolveTransitiveDependencies();
    const packageDDeps = resolvedDeps.get('package-d');
    
    // Should include all transitive dependencies
    expect(packageDDeps?.find(dep => dep.package === 'package-a')).toBeTruthy();
    expect(packageDDeps?.find(dep => dep.package === 'package-b')).toBeTruthy();
    expect(packageDDeps?.find(dep => dep.package === 'package-c')).toBeTruthy();
    
    // Should maintain correct order
    const aIndex = packageDDeps?.findIndex(dep => dep.package === 'package-a');
    const bIndex = packageDDeps?.findIndex(dep => dep.package === 'package-b');
    const cIndex = packageDDeps?.findIndex(dep => dep.package === 'package-c');
    
    expect(aIndex).toBeLessThan(bIndex!);
    expect(bIndex).toBeLessThan(cIndex!);
  });

  it("should return detailed dependency information with direct and transitive dependencies", async () => {
    const config = {
      packageDirectories: [
        {
          package: "package-a",
          versionNumber: "1.0.0.NEXT",
          dependencies: []
        },
        {
          package: "package-b",
          versionNumber: "2.0.0.NEXT",
          dependencies: [
            {
              package: "package-a",
              versionNumber: "1.0.0.LATEST"
            }
          ]
        },
        {
          package: "package-c",
          versionNumber: "1.0.0.NEXT",
          dependencies: [
            {
              package: "package-b",
              versionNumber: "2.0.0.LATEST"
            }
          ]
        }
      ]
    };

    const resolver = new TransitiveDependencyResolver(config);
    const result = await resolver.resolveTransitiveDependenciesWithDetails();
    
    // Verify structure
    expect(result.resolvedDependencies).toBeDefined();
    expect(result.details).toBeDefined();

    // Check package-c details
    const packageCDetails = result.details.get('package-c');
    expect(packageCDetails).toBeDefined();
    
    // Verify package-b is a direct dependency of package-c
    expect(packageCDetails?.['package-b']).toEqual({
      version: '2.0.0.LATEST',
      isDirect: true,
      contributors: ['package-c']  // The package itself is tracked as a contributor
    });

    // Verify package-a is a transitive dependency via package-b
    expect(packageCDetails?.['package-a']).toEqual({
      version: '1.0.0.LATEST',
      isDirect: false,
      contributors: ['package-b']
    });
  });

  it("should track multiple contributors for shared dependencies", async () => {
    const config = {
      packageDirectories: [
        {
          package: "shared-dep",
          versionNumber: "1.0.0.NEXT",
          dependencies: []
        },
        {
          package: "package-a",
          versionNumber: "1.0.0.NEXT",
          dependencies: [
            {
              package: "shared-dep",
              versionNumber: "1.0.0.LATEST"
            }
          ]
        },
        {
          package: "package-b",
          versionNumber: "1.0.0.NEXT",
          dependencies: [
            {
              package: "shared-dep",
              versionNumber: "1.0.0.LATEST"
            }
          ]
        },
        {
          package: "root-package",
          versionNumber: "1.0.0.NEXT",
          dependencies: [
            {
              package: "package-a",
              versionNumber: "1.0.0.LATEST"
            },
            {
              package: "package-b",
              versionNumber: "1.0.0.LATEST"
            }
          ]
        }
      ]
    };

    const resolver = new TransitiveDependencyResolver(config);
    const result = await resolver.resolveTransitiveDependenciesWithDetails();
    
    const rootDetails = result.details.get('root-package');
    expect(rootDetails).toBeDefined();

    // Verify shared-dep has both package-a and package-b as contributors
    const sharedDepDetails = rootDetails?.['shared-dep'];
    expect(sharedDepDetails).toBeDefined();
    expect(sharedDepDetails?.isDirect).toBe(false);
    expect(sharedDepDetails?.version).toBe('1.0.0.LATEST');
    expect(sharedDepDetails?.contributors).toContain('package-a');
    expect(sharedDepDetails?.contributors).toContain('package-b');
    expect(sharedDepDetails?.contributors.length).toBe(2);
  });

  function verifyUniquePkgs(arr) {
    let pkgs = {};
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].hasOwnProperty('package')) {
        if (pkgs.hasOwnProperty(arr[i].package)) {
          return false;
        }
        pkgs[arr[i].package] = true;
      }
    }
    return true;
  }
  

  // TODO: test cache
});

const projectConfig = {
  packageDirectories: [
      {
      path: 'packages/base',
      default: true,
      package: 'base',
      versionName: 'temp',
      versionNumber: '1.0.2.NEXT',
      },
      {
          path: 'packages/temp',
          default: true,
          package: 'temp',
          versionName: 'temp',
          versionNumber: '1.0.0.NEXT',
          dependencies: [
            {
              package: 'base',
              versionNumber: '1.0.2.LATEST'
            }
          ] 
      },
      {
          path: 'packages/core',
          package: 'core',
          default: false,
          versionName: 'core-1.0.0',
          versionNumber: '1.0.0.NEXT',
          dependencies: [
            {
              package: 'temp',
              versionNumber: '1.0.0.LATEST'
            }
          ] 
      },
      {
          path: 'packages/candidate-management',
          package: 'candidate-management',
          default: false,
          versionName: 'candidate-management-1.0.0',
          versionNumber: '1.0.0.NEXT',
          dependencies: [
            {
              package: 'tech-framework@2.0.0.38'
            },
            {
              package: 'core',
              versionNumber: '1.0.0.LATEST'
            }
          ]
      },
      {
        path: 'packages/contact-management',
        package: 'contact-management',
        default: false,
        versionName: 'contact-management-1.0.0',
        versionNumber: '1.0.0.NEXT',
        dependencies: [
          {
            package: 'tech-framework@2.0.0.38'
          },
          {
            package: 'core',
            versionNumber: '1.0.0.LATEST'
          },
          {
            package: 'candidate-management',
            versionNumber: '1.0.0.LATEST'
          },
        ]
    },
    {
      path: 'packages/quote-management',
      package: 'quote-management',
      default: false,
      versionName: 'quote-management-1.0.0',
      versionNumber: '1.0.0.NEXT',
      dependencies: [
        {
          package: 'tech-framework@2.0.0.38'
        },
        {
          package: 'core',
          versionNumber: '1.2.0.LATEST'
        },
        {
          package: 'candidate-management',
          versionNumber: '1.0.0.LATEST'
        },
      ]
  }
  ],
  namespace: '',
  sfdcLoginUrl: 'https://login.salesforce.com',
  sourceApiVersion: '50.0',
  packageAliases: {
    "tech-framework@2.0.0.38": '04t1P00000xxxxxx00',
    "candidate-management": '0Ho4a00000000xxxx1',
    "base": '0Ho4a00000000xxxx1',
    "temp": '0Ho4a00000000xxxx1',
    "core": '0Ho4a00000000xxxx1',
    "contact-management": '0Ho4a00000000xxxx2',
    "sfdc-framework":"04t1000x00x00x"
  },
  "plugins": {
      "sfp": {
          "disableTransitiveDependencyResolver": false,
              "externalDependencyMap": {
                  "tech-framework@2.0.0.38": [
                      {
                          "package": "sfdc-framework"
                      }
                  ]
              }
      }
  }
};
