# Changelog

## [39.3.0](https://github.com/flxbl-io/sfp/compare/v39.2.3...v39.3.0) (2024-12-03)


### Features

* **pool:** add password to fetched scratch org from pool ([#135](https://github.com/flxbl-io/sfp/issues/135)) ([299859b](https://github.com/flxbl-io/sfp/commit/299859b3e4f1c47c5660cf379f653f9ecec5a14b))


### Bug Fixes

* **dependency:** fix incorrect dependency resolution by favouring latest ([#143](https://github.com/flxbl-io/sfp/issues/143)) ([5e0dd5b](https://github.com/flxbl-io/sfp/commit/5e0dd5bdf1481780f0067859b30eb8180fc5a078))
* error in windows "Error: EPERM: operation not permitted, unlink" ([#134](https://github.com/flxbl-io/sfp/issues/134)) ([357b118](https://github.com/flxbl-io/sfp/commit/357b11885872dfd59ef608a5c025147ccfac1ea1))
* **sfppackage:** fix handling of URL-encoded spaces in repository URLs ([#138](https://github.com/flxbl-io/sfp/issues/138)) ([c50cd25](https://github.com/flxbl-io/sfp/commit/c50cd254a3faa675a9f717e1b2c758b575ce64c5))

## [39.2.3](https://github.com/flxbl-io/sfp/compare/v39.2.2...v39.2.3) (2024-10-20)


### Bug Fixes

* **deps:** fix deps to mitigate issuses casued by sfplogger update ([#132](https://github.com/flxbl-io/sfp/issues/132)) ([75da44f](https://github.com/flxbl-io/sfp/commit/75da44f17a644dc9cc54ea355ae7f4c13e40a575))
* **typo:** fix typo with unlocked package collection log ([443bbae](https://github.com/flxbl-io/sfp/commit/443bbae04c56b520551d90a2c40d63637a7cc436))

## [39.2.2](https://github.com/flxbl-io/sfp/compare/v39.2.1...v39.2.2) (2024-09-02)


### Bug Fixes

* **docker:** push to rebuild docker ([d168ed7](https://github.com/flxbl-io/sfp/commit/d168ed779fd8c1660ba06a3cf995d203fecbbdd9))

## [39.2.1](https://github.com/flxbl-io/sfp/compare/v39.2.0...v39.2.1) (2024-08-22)


### Bug Fixes

* **release:** update release title to August 24 ([a060838](https://github.com/flxbl-io/sfp/commit/a060838542a0b56cd686577e221fdab1f758b195))

## [39.2.0](https://github.com/flxbl-io/sfp/compare/v39.1.0...v39.2.0) (2024-08-22)


### Features

* **dependency:install:** add release def filter v2 ([#108](https://github.com/flxbl-io/sfp/issues/108)) ([644f700](https://github.com/flxbl-io/sfp/commit/644f700d6c2b0babe849bdb1066a8432e54c33d2))


### Bug Fixes

* **dependency:resolver:** missing dependencies due to package directory order ([#107](https://github.com/flxbl-io/sfp/issues/107)) ([eb2fa37](https://github.com/flxbl-io/sfp/commit/eb2fa3787dd427f1eff963c123ede64478bd2a13))
* **docs:** update license info ([f555bf4](https://github.com/flxbl-io/sfp/commit/f555bf482f931c0056e0799ee5e2d99f45cff0fd))
* **fht:** fht/ft not being applied for post deployment ([#101](https://github.com/flxbl-io/sfp/issues/101)) ([93a01cf](https://github.com/flxbl-io/sfp/commit/93a01cf0dddded24a94c6a349c9950276f53b66f))
* **pool:** make pools using snapshot pools respect max allocation ([#104](https://github.com/flxbl-io/sfp/issues/104)) ([a39b7d5](https://github.com/flxbl-io/sfp/commit/a39b7d5e46af02d0abae71789b011a22a965570d))
* **schema:** fix missing enableFT to schema ([#106](https://github.com/flxbl-io/sfp/issues/106)) ([6138447](https://github.com/flxbl-io/sfp/commit/61384476edb31466524f8e83a0de6199802b6cf3))

## [39.1.0](https://github.com/flxbl-io/sfp/compare/v39.0.3...v39.1.0) (2024-07-16)


### Features

* **diff:** update apex link to 3.2.1 ([783b1c9](https://github.com/flxbl-io/sfp/commit/783b1c999463fd9d08b15f5c03029682f5a57b19))


### Bug Fixes

* add keywords for better discoverability via npmjs.com ([#91](https://github.com/flxbl-io/sfp/issues/91)) ([2ae2e64](https://github.com/flxbl-io/sfp/commit/2ae2e64f15531d2d7b4003424d6bdceb1b384421))
* **cicd:** fix move to prerelease in root ([c886ea1](https://github.com/flxbl-io/sfp/commit/c886ea17de57c301e1b145557dc7b78a21ecad02))
* **deps:** update apexlink to 3.1.2 ([#93](https://github.com/flxbl-io/sfp/issues/93)) ([f7d0460](https://github.com/flxbl-io/sfp/commit/f7d046069c8b28718a6637a1e702b9eb386472d2))

## [39.0.3](https://github.com/flxbl-io/sfp/compare/v39.0.2...v39.0.3) (2024-06-30)


### Bug Fixes

* **cicd:** update to use version from package.json ([37aae9d](https://github.com/flxbl-io/sfp/commit/37aae9d82882de5129aeaef57c537ca73fca9ada))

## [39.0.2](https://github.com/flxbl-io/sfp/compare/v39.0.1...v39.0.2) (2024-06-30)


### Features

* **cicd:** allow sfp docker image to build on push to main ([9fe94cd](https://github.com/flxbl-io/sfp/commit/9fe94cdc297bf0c9b36bcb87fbacda917fd8b002))
* **cicd:** simplify using release-please ([6312fdf](https://github.com/flxbl-io/sfp/commit/6312fdf43948265ece64cbb02d7c82098d64ff00))
* **dockerfile:** improve mechanism to build locally ([#86](https://github.com/flxbl-io/sfp/issues/86)) ([ddcc19f](https://github.com/flxbl-io/sfp/commit/ddcc19f1428b242a2fcbe67d6f4e154ba9ea55b4))
* **docker:** update sfp cli version ([b631f2d](https://github.com/flxbl-io/sfp/commit/b631f2de5b2733d7d58ddb0541a7238b518d6a86))
* **salesforce:** Upgrade core libs to v8 ([f0c5b62](https://github.com/flxbl-io/sfp/commit/f0c5b62d060c90379af841b5d1cb2ec4ed6490a6))
* **sfdxSchema:** update schema to v8 ([389b74a](https://github.com/flxbl-io/sfp/commit/389b74a7b81b76587c4dab3aec4d8fb8dc29eb89))
* **sfprofiles:** update to v5 ([f2752d0](https://github.com/flxbl-io/sfp/commit/f2752d0c99189fbb2583484696d34cb7ad141841))


### Bug Fixes

* **chore:** fix PR template documentation link ([#59](https://github.com/flxbl-io/sfp/issues/59)) ([89f1bd3](https://github.com/flxbl-io/sfp/commit/89f1bd38c72716d0cd67d9d79a8cf3a53f8457a7))
* **cicd:** add a release-as next for the release configuration ([1dfc27c](https://github.com/flxbl-io/sfp/commit/1dfc27c2bc39820737150cedf0d3802c71c1efd9))
* **cicd:** add bootstrap sha to root ([3fb6b01](https://github.com/flxbl-io/sfp/commit/3fb6b0108578a03db987531045fc128bc9cc5957))
* **cicd:** add prerelease option to release-please config ([7ca1b25](https://github.com/flxbl-io/sfp/commit/7ca1b252fc0cba0d0b8d9dc6ced97fda342ac272))
* **cicd:** create as draft ([5315eea](https://github.com/flxbl-io/sfp/commit/5315eeac423ac02bfa690fcc10288d6ea01616a3))
* **cicd:** fix create as pre-release ([265b20c](https://github.com/flxbl-io/sfp/commit/265b20c78ff182cc93ce85af8b9114cad0673530))
* **cicd:** fix incorrect build process ([2b184ac](https://github.com/flxbl-io/sfp/commit/2b184acde6a0d7773599486dd6c436e89ff851ee))
* **cicd:** remove alpha stage from release pipeline ([14955a6](https://github.com/flxbl-io/sfp/commit/14955a604a5e314d59613e305acc5e66307417a1))
* **cicd:** switch to GITHUB_TOKEN ([841fd4a](https://github.com/flxbl-io/sfp/commit/841fd4a555fac811c785592538d35693663be745))
* **cicd:** update release please configs to draft ([b7a9a8c](https://github.com/flxbl-io/sfp/commit/b7a9a8ce59115da8d1f8a3071720245e6e16c86d))
* **deploy:** 54-Skip deployment when deployment ([111c4e9](https://github.com/flxbl-io/sfp/commit/111c4e9c679bc8c73a2d26fcd8c2afc25fb51f1b))
* **docker:** fix image tagging ([8003a4f](https://github.com/flxbl-io/sfp/commit/8003a4f88ade9557ba8bac8a2c920cb89bad093f))
* **sfdxFlags:** fix broken compatibility due to v6 to v8 upgrade ([8a57ef3](https://github.com/flxbl-io/sfp/commit/8a57ef35495d42af5940e0b835ab0eb87d3431de))
* **sfpPackage:** fix issue with test class not detected ([ef40c71](https://github.com/flxbl-io/sfp/commit/ef40c71e1feb1822d421318c43f36bea2f9837c5))
* **typo:** Typos on user outputs and docs ([#58](https://github.com/flxbl-io/sfp/issues/58)) ([6279245](https://github.com/flxbl-io/sfp/commit/6279245148ffaf7ac78dd2bca6e6cef980bd1974))
* **utils:** fix incorrect commenting of  CRUDHelper ([aa4f73a](https://github.com/flxbl-io/sfp/commit/aa4f73aa845c70af358db107ee5a7b4e894e77ea))


### Miscellaneous Chores

* **main:** release 39.0.1 ([155d05e](https://github.com/flxbl-io/sfp/commit/155d05e5500e8f652036fb3398506ebc2d68fc2f))
* **main:** release 39.0.2 ([99e2581](https://github.com/flxbl-io/sfp/commit/99e258193cb39f3b13a8a6f230bbe2004317e37f))
* release 39.0.1 ([ae8ad28](https://github.com/flxbl-io/sfp/commit/ae8ad28a434e4a969f7c648cacf2c7c3936c70e2))

## [39.0.1](https://github.com/flxbl-io/sfp/compare/v39.0.0...v39.0.1) (2024-06-29)


### Bug Fixes

* **cicd:** create as draft ([5315eea](https://github.com/flxbl-io/sfp/commit/5315eeac423ac02bfa690fcc10288d6ea01616a3))


### Miscellaneous Chores

* **main:** release 39.0.1 ([155d05e](https://github.com/flxbl-io/sfp/commit/155d05e5500e8f652036fb3398506ebc2d68fc2f))

## [39.0.0](https://github.com/flxbl-io/sfp/compare/v38.6.1...v39.0.0) (2024-06-29)


### ⚠ BREAKING CHANGES

* **validate:** Changes the earlier behaviour across all validation modes
* **scope:** All existing alpha rc users has to do a fresh installation
* sfp-cli: Reorganize commands and topics
* **cleanup:** orchestrator topic is deprecated, use orchestrator commands without orchestrator topic directly such as sfp:build
* **release:** changelog will be written for each release config by computing the name, and will be pushed individually
* **install:** deprecates existing individual package installation commands
* **build:** Build will not fail if there is nothing to be built

### Features

* Always use the newest validation scratch org during Validate ([#1428](https://github.com/flxbl-io/sfp/issues/1428)) ([8b93c2a](https://github.com/flxbl-io/sfp/commit/8b93c2a44f6224dc02342a829302de00cd43e09f))
* **apexparser:** upgrade apexparser to 4.0.0 ([#49](https://github.com/flxbl-io/sfp/issues/49)) ([0237c25](https://github.com/flxbl-io/sfp/commit/0237c25ee57d12e55db52ab40087c871dfd725ba))
* **build:** add support for building multiple domains ([5bb6580](https://github.com/flxbl-io/sfp/commit/5bb6580a16f9ca23707821121081687c82572e60))
* **changelog:** add commit links in changelog markdown ([b06123f](https://github.com/flxbl-io/sfp/commit/b06123ffad42d673a2d94a25f41b95cc4bb95f0b))
* **changelog:** display commits in changelog for dryrun ([5b34c62](https://github.com/flxbl-io/sfp/commit/5b34c625b70b529f07baa6b440cea9f57f3dfdf6))
* **ci:** add a sfp-lite docker image just containing sfp ([0699e51](https://github.com/flxbl-io/sfp/commit/0699e5135ec1e78e2958c2cc8ae1355fae1b02ef))
* **cicd:** add a test brach to build docker ([1b01057](https://github.com/flxbl-io/sfp/commit/1b010579642f4a6315cd891147664786d0369300))
* **cicd:** simplify using release-please ([6312fdf](https://github.com/flxbl-io/sfp/commit/6312fdf43948265ece64cbb02d7c82098d64ff00))
* **cleanup:** cleanup existing commands description and remove deprecated commands ([f01284c](https://github.com/flxbl-io/sfp/commit/f01284cb859409c4a60d16232eaa553adc8fb9c7))
* **deploy:** add a markdown output for deployment failure for a package ([70093e5](https://github.com/flxbl-io/sfp/commit/70093e5d438307103bc40372dc889ae26661c99e))
* **deploy:** add additional color hightlight ([58569b4](https://github.com/flxbl-io/sfp/commit/58569b4ecd94a070073654ab6ca1938f6435930e))
* **deploy:** flow activation and deactivation during package installation ([#17](https://github.com/flxbl-io/sfp/issues/17)) ([05cb81f](https://github.com/flxbl-io/sfp/commit/05cb81f2772dac7789ea058ace401e283dfdce50))
* **deps:** update to v6 of salesforce dependencies ([#3](https://github.com/flxbl-io/sfp/issues/3)) ([9e71429](https://github.com/flxbl-io/sfp/commit/9e714293effa3e0aac8ff1011515793fc0df097a))
* **diff:** add an option for override ([c9316dd](https://github.com/flxbl-io/sfp/commit/c9316ddc4c273544ec95c83b36b633e7ee6fb5d9))
* **docker:** update sfp cli version ([b631f2d](https://github.com/flxbl-io/sfp/commit/b631f2de5b2733d7d58ddb0541a7238b518d6a86))
* **docker:** use node 18 LTS instead of the latest 20.x version ([#1421](https://github.com/flxbl-io/sfp/issues/1421)) ([ec6b165](https://github.com/flxbl-io/sfp/commit/ec6b16559c22d808a3e8866d8673299e09902f53))
* **fetch package id:** add new logic for promoted pcks ([#20](https://github.com/flxbl-io/sfp/issues/20)) ([f6cd8a5](https://github.com/flxbl-io/sfp/commit/f6cd8a50d1561cee0ac180c5c1eb8738825b15fb))
* **fetch:** remove dependency on project directory for a scratch org fetch ([4ef8539](https://github.com/flxbl-io/sfp/commit/4ef8539d27c443df26453fefc640d50d56ce3773))
* **impact:** add additional options to consider only changed files during release config impact ([3a5d87a](https://github.com/flxbl-io/sfp/commit/3a5d87a558ad5ff592ff7cc9b2b12cd2575da0aa))
* **impact:** add impact:package and impact:releaseconfig commands ([ec884dc](https://github.com/flxbl-io/sfp/commit/ec884dceeb2c4e14b2c346a3f41c85e90667b39d))
* **install:** install to support installation of  single artifact ([85f440c](https://github.com/flxbl-io/sfp/commit/85f440c1bbd4c52e2a9666af11bf86bbe901814b))
* **install:** introduce a unified package installation command ([#1420](https://github.com/flxbl-io/sfp/issues/1420)) ([690b7bc](https://github.com/flxbl-io/sfp/commit/690b7bcd843b6f2382f02abec8bf96503e8d397e))
* **install:** Specify testLevel for a not optimized source package validating ([#1434](https://github.com/flxbl-io/sfp/issues/1434)) ([00d7b64](https://github.com/flxbl-io/sfp/commit/00d7b64dbeceed89ef8dbe48d7b349d84cff391d))
* **markdown:** add additional markdown outptus in deploy build and validate ([b8f327d](https://github.com/flxbl-io/sfp/commit/b8f327d8acfed3e14476cffb656178fd476d9561))
* **orchestrator:** elevate orchestrator commands directly as the default commands ([a4a5c3a](https://github.com/flxbl-io/sfp/commit/a4a5c3af97660299fcd4cef744ef19260775b2e1))
* **output:** Add outputs as a key entity ([1212814](https://github.com/flxbl-io/sfp/commit/1212814510c0d250eb213becb42966deba5b2c4f))
* **output:** add promotion status to deployment breakdown markdown ([7b8bd5d](https://github.com/flxbl-io/sfp/commit/7b8bd5dfa994db1336797ac82553d63a36c7e4ee))
* **prepare-c-flag:** add noAnchestors option to config ([#9](https://github.com/flxbl-io/sfp/issues/9)) ([ab8ca59](https://github.com/flxbl-io/sfp/commit/ab8ca59d5f17d8ba89f13af08037043d30a62f5f))
* **prepare:** add a log to display packages that are restricted as per release config ([a3b021f](https://github.com/flxbl-io/sfp/commit/a3b021f40335f7ac1d6bed519d54faae46025037))
* **profiles:** add profile merge and retrieve to sfp ([#1353](https://github.com/flxbl-io/sfp/issues/1353)) ([d783041](https://github.com/flxbl-io/sfp/commit/d78304186b704e376df335e908230bb4e7caa6a3))
* **release:** add a markdown deployment breakdown during dryun ([0f7057f](https://github.com/flxbl-io/sfp/commit/0f7057f897df95bce9735cdb6b415658be0d43f1))
* **release:** add an option to skip artifact record update in release ([d04ffd6](https://github.com/flxbl-io/sfp/commit/d04ffd6e9272f29465e4e6f33b015968da54b96e))
* **releaseconfig:** add an option for explict dependency for packages within the repository ([#1447](https://github.com/flxbl-io/sfp/issues/1447)) ([4d0159a](https://github.com/flxbl-io/sfp/commit/4d0159a7e19f608e87588d306cc2aedfd7f7d25e))
* **release:** enhanced support for multiple release definitions in release command ([#14](https://github.com/flxbl-io/sfp/issues/14)) ([d2dbe62](https://github.com/flxbl-io/sfp/commit/d2dbe62ac3c22c56bbbb1ffcf0d3b3c08af019fb))
* **release:** introduce additional properties to release config and definition ([4f33fd4](https://github.com/flxbl-io/sfp/commit/4f33fd4b876dd88ebbda17a5c2a13ee617284713))
* **releaselogs:** add an option for workitem only output ([eeab3b0](https://github.com/flxbl-io/sfp/commit/eeab3b07b8d5757f39c1a3d91ed91ba3f2bbae29))
* remove sfdc-soup, update deps ([768d499](https://github.com/flxbl-io/sfp/commit/768d499fc39f379ce20ea1885a46bb379fcf0e14))
* **salesforce:** Upgrade core libs to v8 ([f0c5b62](https://github.com/flxbl-io/sfp/commit/f0c5b62d060c90379af841b5d1cb2ec4ed6490a6))
* sfp-cli: Reorganize commands and topics ([71bdcde](https://github.com/flxbl-io/sfp/commit/71bdcdeece1d15c46a1f485e735398c1590fe1c8))
* **sfp:** new org login url command ([#19](https://github.com/flxbl-io/sfp/issues/19)) ([355488c](https://github.com/flxbl-io/sfp/commit/355488cbea91c9e307909379a63fc326dc58bcf3))
* **validate:** add a header to show release configs used ([12d5e71](https://github.com/flxbl-io/sfp/commit/12d5e7134a05cd590f355f7f8d3580dc8fb481f9))
* **validate:** add a markdown output for validation errors ([bccbb58](https://github.com/flxbl-io/sfp/commit/bccbb58c86581f5d11305e5e0595a5508370eb55))
* **validate:** change terminology of validate commands to validate org and validate pool ([24db5a3](https://github.com/flxbl-io/sfp/commit/24db5a3cf3a068a4f05a10e751379d6ef4afacdf))
* **validate:** only trigger tests from impacted packages ([#39](https://github.com/flxbl-io/sfp/issues/39)) ([799d26b](https://github.com/flxbl-io/sfp/commit/799d26b86c114727fea0bcc1636669fff84e0170)), closes [#5](https://github.com/flxbl-io/sfp/issues/5)
* **validate:** validate to support multiple release configs ([2b86b2e](https://github.com/flxbl-io/sfp/commit/2b86b2ea968162491517a09f17cc068dcda40b37))


### Bug Fixes

* **apex-test:** additional parallel run error ([#1436](https://github.com/flxbl-io/sfp/issues/1436)) ([0403a24](https://github.com/flxbl-io/sfp/commit/0403a249a4ee588e319a2b07bd00759b0010d9a0))
* **apextest:** fix error message when apex test is cancelled in the org ([612ae62](https://github.com/flxbl-io/sfp/commit/612ae62dacaf8b0c511084d2944bceab0cb8d4db))
* **apextests:** add error handling to replace ([a08d135](https://github.com/flxbl-io/sfp/commit/a08d13584ce9486b423c7a02663a8998e678f28e))
* **apextests:** handle conditions where test results are inaccurate from salesforce ([6e18ba6](https://github.com/flxbl-io/sfp/commit/6e18ba6db3a9468cf4c5ec0418f61996ffa44c5e))
* **apextests:** incorrect usage of jsonOutput ([6ca7222](https://github.com/flxbl-io/sfp/commit/6ca7222ab4296070f22e22b33137e56c56dfddeb))
* **apextests:** only attempt to dereference status, when value exists ([f6fe344](https://github.com/flxbl-io/sfp/commit/f6fe3446435dcc32e5c78c031c79367ab1acc771)), closes [#1408](https://github.com/flxbl-io/sfp/issues/1408)
* **artifactfetch:** search for artifacts with scope ([9315afa](https://github.com/flxbl-io/sfp/commit/9315afa3927099192653bc1f0f8e032689143b86))
* **browserforce:** revert "Increment browserforce plugin to v2.11.0" ([#1337](https://github.com/flxbl-io/sfp/issues/1337)) ([853ee03](https://github.com/flxbl-io/sfp/commit/853ee03bf762aee92bbd9dd00a2f5f6d714b20a7))
* **build:** add a new line to output ([855fa38](https://github.com/flxbl-io/sfp/commit/855fa38610dff7fbe55d5d2468e7e21352182a22))
* **build:** do not fail if there is nothing to be built ([dd90957](https://github.com/flxbl-io/sfp/commit/dd9095745a12c970de28f6b645d0c1cccc87fd34))
* **build:** fix build job removes too many pcks issue [#1199](https://github.com/flxbl-io/sfp/issues/1199) ([4523b6f](https://github.com/flxbl-io/sfp/commit/4523b6ffe89a2390c42c0d34f99b70ffce328394))
* **build:** fix typo with failure message ([9194f97](https://github.com/flxbl-io/sfp/commit/9194f9787db27c39f9ffa10099dfaa0d18e6b5a7))
* **build:** improve text on error display ([bca3551](https://github.com/flxbl-io/sfp/commit/bca3551e9066c47030ae08cb876294c1776e013b))
* **changelog:** add date to changelog ([4ac6813](https://github.com/flxbl-io/sfp/commit/4ac68133443e18b48a76de9d27d3f695776ef49e))
* **changelog:** add functionality to match release by name ([dc9ca23](https://github.com/flxbl-io/sfp/commit/dc9ca2359f708a27713ca047a19d04feb5b2179e))
* **changelog:** make repoUrl optional ([10fbdb2](https://github.com/flxbl-io/sfp/commit/10fbdb2ba905094c27aebf86f2eb54e4a32a1848))
* **changelogmarkdown:** do not print date ([bbee5b5](https://github.com/flxbl-io/sfp/commit/bbee5b51377bac41c5525c943feeaeb4b1601557))
* **changelog:** remove bulletpoint in markdown ([e48e20d](https://github.com/flxbl-io/sfp/commit/e48e20d72e9553ece2f4912e06570e2e38c95e44))
* **changelog:** revert creation of changelog during run as the table is broken ([5e4cb36](https://github.com/flxbl-io/sfp/commit/5e4cb364da63534ca157851fe2a94d9f24544f74))
* **chore:** fix PR template documentation link ([#59](https://github.com/flxbl-io/sfp/issues/59)) ([89f1bd3](https://github.com/flxbl-io/sfp/commit/89f1bd38c72716d0cd67d9d79a8cf3a53f8457a7))
* **cicd:** add a release-as next for the release configuration ([1dfc27c](https://github.com/flxbl-io/sfp/commit/1dfc27c2bc39820737150cedf0d3802c71c1efd9))
* **cicd:** add cosign installer ([d40251e](https://github.com/flxbl-io/sfp/commit/d40251eac3ab9664717ddf2975200feb23ca4fee))
* **cicd:** change digest back to full sha ([a487416](https://github.com/flxbl-io/sfp/commit/a487416953074328c6cf3c5783bb1433b0db2b13))
* **cicd:** change to GITHUB_TOKEN ([a951573](https://github.com/flxbl-io/sfp/commit/a951573eff273b3540fb128844a2ae46ef4c6bff))
* **cicd:** change to oidc siginging ([66328a2](https://github.com/flxbl-io/sfp/commit/66328a2412732aaa00052ba8401cdf523b7daba3))
* **cicd:** fix create as pre-release ([265b20c](https://github.com/flxbl-io/sfp/commit/265b20c78ff182cc93ce85af8b9114cad0673530))
* **cicd:** fix default repo location ([8925c10](https://github.com/flxbl-io/sfp/commit/8925c10ad2827a5c32f2498c59a42a725140da12))
* **cicd:** fix file names and environment to sfp ([fe1137f](https://github.com/flxbl-io/sfp/commit/fe1137f10dad258611d136cad7815b21e39692a5))
* **cicd:** fix incorrect build process ([2b184ac](https://github.com/flxbl-io/sfp/commit/2b184acde6a0d7773599486dd6c436e89ff851ee))
* **cicd:** fix job names to sfp ([a7c41f8](https://github.com/flxbl-io/sfp/commit/a7c41f857203cdc472f904fd8e058f135ef7ca93))
* **cicd:** fix path to package ([d7b4ca9](https://github.com/flxbl-io/sfp/commit/d7b4ca945713dcbaf4d048ca1c243e97a43eb801))
* **cicd:** fix repo name ([b445702](https://github.com/flxbl-io/sfp/commit/b44570236e8ae8887bd12b62ee940b6912218f10))
* **cicd:** fix secret used in publishing ([a7cd6a0](https://github.com/flxbl-io/sfp/commit/a7cd6a0f156d97a74cbab1da73b5c925e45fc0fa))
* **cicd:** fix use to sfp ([12a2d23](https://github.com/flxbl-io/sfp/commit/12a2d237c0e14434b98119b10e6a7b1a29eb3294))
* **cicd:** fix usernames used in pipelines ([74c5157](https://github.com/flxbl-io/sfp/commit/74c51578020e90aaef5e2db7663e518cb835293f))
* **cicd:** remove dangling tag that is empty ([f8ddbf7](https://github.com/flxbl-io/sfp/commit/f8ddbf73855a950e325bca880f7cd30da1eeef5b))
* **cicd:** remove run name ([f82a456](https://github.com/flxbl-io/sfp/commit/f82a4564f8f026ab5b8a610158b1658d44e8a52c))
* **cicd:** switch to GITHUB_TOKEN ([841fd4a](https://github.com/flxbl-io/sfp/commit/841fd4a555fac811c785592538d35693663be745))
* **cicd:** update release please configs to draft ([b7a9a8c](https://github.com/flxbl-io/sfp/commit/b7a9a8ce59115da8d1f8a3071720245e6e16c86d))
* **ci:** fix incorrect placement of values ([09cd4c4](https://github.com/flxbl-io/sfp/commit/09cd4c4a97794587b4d8412e58bf1f494d3abcea))
* **ci:** fix workflows and dependency ([b1f7351](https://github.com/flxbl-io/sfp/commit/b1f73516f99c131036a79ee37b1b20706083eef7))
* **commands:** fix all commands to display sfp in examples ([461d9ac](https://github.com/flxbl-io/sfp/commit/461d9acdd41e17ed65865caa9abc2a7307af9f2b))
* **config:** add public config ([811b30a](https://github.com/flxbl-io/sfp/commit/811b30adca021475facd71dc6a251955645436a4))
* convert to pnpm ([9893153](https://github.com/flxbl-io/sfp/commit/989315300fabede28fd7734f9a7ed9c0e496a676))
* **deploy:** 54-Skip deployment when deployment ([111c4e9](https://github.com/flxbl-io/sfp/commit/111c4e9c679bc8c73a2d26fcd8c2afc25fb51f1b))
* **deploy:** add correct status of install ([d755755](https://github.com/flxbl-io/sfp/commit/d755755d834fe77f01fc40df77084d681f3178d2))
* **deploy:** create file before writing ([55d6766](https://github.com/flxbl-io/sfp/commit/55d67663c1c5ce752812d6cae81666e32e08016b))
* **deploy:** fix blank logger being printed during prepare by deploy command ([3d2bfba](https://github.com/flxbl-io/sfp/commit/3d2bfba70ce639a8016e76898f6d0bbecc1b3b01))
* **deploy:** fix flags used for targetusername ([6355eb7](https://github.com/flxbl-io/sfp/commit/6355eb7a33e295b144f29d444e58d096537c2c3a))
* **deploy:** fix header being incorrectly displayed to console log ([a23e023](https://github.com/flxbl-io/sfp/commit/a23e023587a7a4716ab6511bd27e91b7be5f5a5d))
* **deploy:** fix incorrect dereferencing ([29eea37](https://github.com/flxbl-io/sfp/commit/29eea37b31eb447d3002b4e4512168857a319a58))
* **deploy:** fix incorrect props ([f052bc8](https://github.com/flxbl-io/sfp/commit/f052bc8dc5f5b05ab7c68c89162f157f0fd4c8cb))
* **deploy:** handle N/A in deployment breakdown ([8fc4fc7](https://github.com/flxbl-io/sfp/commit/8fc4fc7461e824a99c6381e0cff4ffa66baa6998))
* **deploy:** Honor waitTime for Deploy commands ([#1443](https://github.com/flxbl-io/sfp/issues/1443)) ([8593188](https://github.com/flxbl-io/sfp/commit/85931881af41717d198eb662cc7268613a516902))
* **deploy:** only display promotion status for prod ([e91f86a](https://github.com/flxbl-io/sfp/commit/e91f86ad5263d2737ef003a660b0d74dbb8055c6))
* **deploy:** print coverage warnings when source package fails ([3c3cacf](https://github.com/flxbl-io/sfp/commit/3c3cacfbfda982384ecef1942d579c9c8524b8f8))
* **deps:** fix usage of glob ([48f6bd8](https://github.com/flxbl-io/sfp/commit/48f6bd8f3040c015c47a0dd60bbb028ec52320f8))
* **deps:** remove unused files from sfprofiles ([0aea0b5](https://github.com/flxbl-io/sfp/commit/0aea0b5e6389522cc31e091575d8ecb4f90ff174)), closes [#1382](https://github.com/flxbl-io/sfp/issues/1382)
* **deps:** update jsforce to v27 ([414e030](https://github.com/flxbl-io/sfp/commit/414e030e805887d2c5f44e34a81ff09e6d3a32ed))
* **deps:** update lock file ([c913ebe](https://github.com/flxbl-io/sfp/commit/c913ebe1a9a777a484c3b1218d5e13f500a63858))
* **dicker:** add ca-certifact to dependencies ([4c99c3d](https://github.com/flxbl-io/sfp/commit/4c99c3ded2dd498534aa01f28f185725b85ea9a9))
* **diff:** diff package not correctly copying static resources ([2280229](https://github.com/flxbl-io/sfp/commit/22802292682fc1119c1c177e45100534825c2c00))
* **diff:** ensure --no-renames is used for branchcompare ([8a59432](https://github.com/flxbl-io/sfp/commit/8a594324b31a78f0bee7e707bc871d948749fc8e))
* **diff:** fix incorrect argument in diff calculation ([63ad7e4](https://github.com/flxbl-io/sfp/commit/63ad7e4e3759a71e2a1f91a850159fbc88ec9d64))
* **diff:** ingore coverage validation when diff doesnt contain impacted apex classes ([858e195](https://github.com/flxbl-io/sfp/commit/858e1952dce028bf8b46e75086f9975d8e79a119))
* **diff:** package component diff fails when unknown type is encountered ([fd818f1](https://github.com/flxbl-io/sfp/commit/fd818f1d3dbf91fb6d94e95e27323171f152f329)), closes [#1358](https://github.com/flxbl-io/sfp/issues/1358)
* **diff:** throw error if file is missing in repository ([4b27744](https://github.com/flxbl-io/sfp/commit/4b2774448f66767fd7423777c5a9f8f99dbc3e52))
* **diff:** various fixes in diff to support branch compare ([5070266](https://github.com/flxbl-io/sfp/commit/507026625b798360523aed78d32d37151e1a57e9))
* **docker:** add correct variable to skip version check ([94042a5](https://github.com/flxbl-io/sfp/commit/94042a5c7d95d7a57eebdd494b10fd061958dd6f))
* **docker:** add gnupg to docker-lite ([6320994](https://github.com/flxbl-io/sfp/commit/63209940e333f5feaf12235df0cf47d279f268f8))
* **docker:** add missing lib files ([6d3814b](https://github.com/flxbl-io/sfp/commit/6d3814b88d6e231940f65078edff159ba10f3777))
* **docker:** add packaging plugin ([d26480d](https://github.com/flxbl-io/sfp/commit/d26480d0c66fda04930b64600b08d4b0ebb2850a))
* **docker:** add symbolic link ([d26480d](https://github.com/flxbl-io/sfp/commit/d26480d0c66fda04930b64600b08d4b0ebb2850a))
* **docker:** add symbolic link to sh ([d26480d](https://github.com/flxbl-io/sfp/commit/d26480d0c66fda04930b64600b08d4b0ebb2850a))
* **docker:** add timzone package ([79c479b](https://github.com/flxbl-io/sfp/commit/79c479b0cde689615712e1eaa1a93035f86229b5))
* **docker:** add xdg directories and move to sf for sfdmu ([753d9a4](https://github.com/flxbl-io/sfp/commit/753d9a449becdb9ab0b039c360e52b7652bf6ff2))
* **docker:** fix missing  plugin scope ([e45d68a](https://github.com/flxbl-io/sfp/commit/e45d68a9c53d2e0f3978abda67b91c84d5f79f51))
* **docker:** fix missing var syntax ([114b419](https://github.com/flxbl-io/sfp/commit/114b419af487f1457eeb8579b31d0e6349469a10))
* **docker:** fix move to node 18 ([d26480d](https://github.com/flxbl-io/sfp/commit/d26480d0c66fda04930b64600b08d4b0ebb2850a))
* **docker:** fix package name used in image ([b188c56](https://github.com/flxbl-io/sfp/commit/b188c56b7de1cb83fd3a7a51d1c6fb1cb281bc7d))
* **docker:** fix release names not flowing through ([ba47dcf](https://github.com/flxbl-io/sfp/commit/ba47dcfe52a69f747d4c2782c52d4f113f9eaf3e))
* **docker:** fix version name ([e537d5f](https://github.com/flxbl-io/sfp/commit/e537d5f9ed1df99e4096dc65019afaf758507290))
* **docker:** install commonly used plugins ([3244b74](https://github.com/flxbl-io/sfp/commit/3244b74cf771f0307e29348450ce85b150329e31))
* **docker:** remove cache removal ([d0f9a72](https://github.com/flxbl-io/sfp/commit/d0f9a7206234e94ba42cff5228c7696acc69f07b))
* **docker:** remove entry point and workdir ([d26480d](https://github.com/flxbl-io/sfp/commit/d26480d0c66fda04930b64600b08d4b0ebb2850a))
* **docker:** remove failing root cleanup ([d26480d](https://github.com/flxbl-io/sfp/commit/d26480d0c66fda04930b64600b08d4b0ebb2850a))
* **docker:** remove high uid in docker image and migrate to sf CLI v2 ([#1380](https://github.com/flxbl-io/sfp/issues/1380)) ([81ccf2f](https://github.com/flxbl-io/sfp/commit/81ccf2f74401dc085aeb71fd29622970059c27c4))
* **docker:** remove lwc-test and community ([297d317](https://github.com/flxbl-io/sfp/commit/297d3178a48def8bbec89ed4350990bfe1850e04))
* **docker:** remove plugin-packaging ([4235c8a](https://github.com/flxbl-io/sfp/commit/4235c8a721a8cd0892538e7b6b342ced21687a73))
* **docker:** remove root cleanup ([d26480d](https://github.com/flxbl-io/sfp/commit/d26480d0c66fda04930b64600b08d4b0ebb2850a))
* **docker:** remove unused versions ([c84c4cc](https://github.com/flxbl-io/sfp/commit/c84c4cc460cfd59d2571586536ed063af33e53ee))
* **docker:** revert back to old image ([8ecad97](https://github.com/flxbl-io/sfp/commit/8ecad9737c00eca22f2e84bcb6660a495f6bcab9))
* **docker:** revert to ubuntu 22 ([d26480d](https://github.com/flxbl-io/sfp/commit/d26480d0c66fda04930b64600b08d4b0ebb2850a))
* **docker:** rollback to previous image defn ([438f9ba](https://github.com/flxbl-io/sfp/commit/438f9bafd0bf177869a84e1e14bddecda6c018c1))
* **docker:** set puppetteer cache dir ([524c283](https://github.com/flxbl-io/sfp/commit/524c283992508adcb413e2f3303c39558400a31d))
* **docker:** switch to cli image ([d26480d](https://github.com/flxbl-io/sfp/commit/d26480d0c66fda04930b64600b08d4b0ebb2850a))
* **docker:** switch to heroku base image ([d26480d](https://github.com/flxbl-io/sfp/commit/d26480d0c66fda04930b64600b08d4b0ebb2850a))
* **docker:** temporarily rollback to old version ([246a33a](https://github.com/flxbl-io/sfp/commit/246a33a739428301d464d0ee75c6879f2e3e31e5))
* **docker:** temporary remove cleaning of cache ([dca75e6](https://github.com/flxbl-io/sfp/commit/dca75e6648dba6e98f921b4352df35f91a5336b5))
* **docker:** temporary rollback to old image ([5ab1900](https://github.com/flxbl-io/sfp/commit/5ab19002f66fa843a2a4c6605829c41ad87cea65))
* **docker:** update for further investigations ([07cb4ad](https://github.com/flxbl-io/sfp/commit/07cb4ad7a94b14b247ce137ffeb0906f37a18d2b))
* **docker:** update links in docker ([077009f](https://github.com/flxbl-io/sfp/commit/077009f3ad56d38554086e8b5ae52b111f012027))
* **docker:** update sf-cli to 2.17.14 ([884efe9](https://github.com/flxbl-io/sfp/commit/884efe94f36b58ab23a0ced83a266d389583e8d2))
* **docker:** update sf-cli variable correctly ([ae58f6f](https://github.com/flxbl-io/sfp/commit/ae58f6fdbba836a4bf840e5fa35b1be14487a0a9))
* **docker:** update to sf cli 2.8.11 ([d26480d](https://github.com/flxbl-io/sfp/commit/d26480d0c66fda04930b64600b08d4b0ebb2850a))
* **docker:** update to v0.0.3 of browserforce ([2373b2d](https://github.com/flxbl-io/sfp/commit/2373b2d39c6ce91e08b4d7a4d5596f11cae2fcd5))
* **docker:** update url links to docker ([6432fc6](https://github.com/flxbl-io/sfp/commit/6432fc6182859bb2f51e6512a01ef8015b3a633a))
* **docker:** use lower uid in dockerfiles ([#1409](https://github.com/flxbl-io/sfp/issues/1409)) ([78739d5](https://github.com/flxbl-io/sfp/commit/78739d5b535c31ee0ab98d8aa97f7cfecb145182))
* **docker:** use node:20 and remove unused cache from npm and yarn ([#1395](https://github.com/flxbl-io/sfp/issues/1395)) ([8ab0e34](https://github.com/flxbl-io/sfp/commit/8ab0e34025805055436bdddad80fa39cafeb1c4c))
* **docs:** some typos in documentation and comments ([#1433](https://github.com/flxbl-io/sfp/issues/1433)) ([bd2b216](https://github.com/flxbl-io/sfp/commit/bd2b216651e5e07aa759cad14e508bdd37987ee2))
* **docs:** update readme ([040d25c](https://github.com/flxbl-io/sfp/commit/040d25cd96e1853706c69b5ec6446ed8be9a8933))
* **docs:** Update README.md ([aaa2fc0](https://github.com/flxbl-io/sfp/commit/aaa2fc089c76403511b893f451796ba24468fca7))
* **docs:** Update README.md ([#23](https://github.com/flxbl-io/sfp/issues/23)) ([e735c48](https://github.com/flxbl-io/sfp/commit/e735c480c6b316d6062d778267b512e5bdc5dc9a))
* **eexpandd:** fix incorrect flag assignment ([6d83cef](https://github.com/flxbl-io/sfp/commit/6d83cef140a675c6be66d9138d5ef26a40deef78))
* **envvar:** revert env var to use SFPOWERSCRIPTS nomenclature for backward compatibility ([028a179](https://github.com/flxbl-io/sfp/commit/028a179cb73aeca339694fde4cbddf03412e4903))
* **fetch:** enable json flag for pool fetch command ([#1404](https://github.com/flxbl-io/sfp/issues/1404)) ([f16dec3](https://github.com/flxbl-io/sfp/commit/f16dec35b8b5bb7f3a3cfe643a8bb11fc597ff96))
* **fetch:** fix examples of using pool fetch ([d222854](https://github.com/flxbl-io/sfp/commit/d2228546c775e75ebbd4c7cdc307d0a98319547d))
* fix broken tests due to changes in test fixture ([d2ef9ef](https://github.com/flxbl-io/sfp/commit/d2ef9efbbb247fd60adbffcd54cb91ff2a566659))
* **flags:** ensure json is available for backward compat ([abe559e](https://github.com/flxbl-io/sfp/commit/abe559ede139b44814bb71cefb4d328c35fb3348))
* **flags:** maintain compat with targetdevhubusername ([57cb074](https://github.com/flxbl-io/sfp/commit/57cb07482860d47c106f0f87b8eb840f62072349))
* **flags:** remove unused orgFlags ([2442072](https://github.com/flxbl-io/sfp/commit/2442072b465bc2a4a8f0bb2cc38390113745a005))
* **flow:** add additonal log info ([918d8d9](https://github.com/flxbl-io/sfp/commit/918d8d9099d9f7df923df8afb772649167913665))
* **flow:** fix activation issue in production when a flow is deployed inactive ([6948c9d](https://github.com/flxbl-io/sfp/commit/6948c9df58e27b5a80a1fb143350b28280d3024a))
* **flow:** handle multiple flows in the package ([e19cd77](https://github.com/flxbl-io/sfp/commit/e19cd7709932021ba44893167b1cb2af8811b6a2))
* **flows:** add additional text when no flows are found in a package ([1b29028](https://github.com/flxbl-io/sfp/commit/1b29028cf2099c2c9d8ab76565856d5d71db75b5))
* **flows:** fix incorrect activation sequence ([fe3e7c4](https://github.com/flxbl-io/sfp/commit/fe3e7c4048b00bbe143450ae53dc7a102e8dec8e))
* **git:** add an exception catch to gith init ([4715ac3](https://github.com/flxbl-io/sfp/commit/4715ac3ea5ece03ae40a3e703be1ef7dd844f61a))
* **git:** add exception handler to safeConfig ([7cbc198](https://github.com/flxbl-io/sfp/commit/7cbc19860fe81082b33ed2e6db2377e015326c32))
* **git:** ignore safeconfig error ([9fabd9f](https://github.com/flxbl-io/sfp/commit/9fabd9f486d8d59ebe37a5f83b0255d6081929e5))
* **header:** incorporate review feedback to simplify header ([0588ab9](https://github.com/flxbl-io/sfp/commit/0588ab97c822fd859808e19c65e6e2b55700c3de))
* **impactanalysis:** remove dagre and other resources ([0dbef96](https://github.com/flxbl-io/sfp/commit/0dbef965146358a34a9564b5e435e4ca067597ad))
* **impact:** fix impacted files not accurately reported ([2be31ec](https://github.com/flxbl-io/sfp/commit/2be31ec916c5daa8016d04c43bc0f747865973a5))
* **impact:** fix incorrect dependencyOnHandling ([252c3a4](https://github.com/flxbl-io/sfp/commit/252c3a48ae3d867024104a23cb0903a7ecb2d62f))
* **impact:** fix typo with explict dependency check flag ([2521a41](https://github.com/flxbl-io/sfp/commit/2521a4168edcc5fb2488d79456ef42f007e99285))
* **impact:** incorporate configs of dependencyOn accurately ([e0725f4](https://github.com/flxbl-io/sfp/commit/e0725f4b7f94f82707f009e9b45ff5c88a94be5a))
* **impact:** move to pools due to change in schema ([cee3b3a](https://github.com/flxbl-io/sfp/commit/cee3b3ae5e27bfe5909271cb2967df5684a11ed2))
* **impact:** remove hard requirement on branch flag ([d89db61](https://github.com/flxbl-io/sfp/commit/d89db617121e601c9f65a42efb2afce6b0f777dd))
* **impact:** use correct variable in table ([43c66f2](https://github.com/flxbl-io/sfp/commit/43c66f2b67ed021c104f7a617f17e009c0c59786))
* **install:** add older alias for easier refactoring in sfops ([73f6416](https://github.com/flxbl-io/sfp/commit/73f64169adab9ac552928d071f7e53a1bf2b4dc7))
* **install:** remove apexcompileonlypackage ([bf655cf](https://github.com/flxbl-io/sfp/commit/bf655cfe155a0bdbc2d039074a41db60ce58e4b4))
* **json:** disable pretty printing in json mode ([2fa6cf6](https://github.com/flxbl-io/sfp/commit/2fa6cf65c9a4b0c65ab43a7e2483fef6747d1ef0))
* **lint:** fix issues raised by linter ([9f7d9ab](https://github.com/flxbl-io/sfp/commit/9f7d9ab9ba2cbf6a82ba33f1d567a8cba21ec377))
* **lint:** fix linter errors ([e3d123d](https://github.com/flxbl-io/sfp/commit/e3d123d3ed867b576906133e1c0f827b4b78b521))
* **logger:** logger shouldn't print headerlines in json mode ([3f461b6](https://github.com/flxbl-io/sfp/commit/3f461b6e793cafa7121a79f7ce258d11fa06ef36))
* **login:** fix bundle pathway used in org login ([9161f3f](https://github.com/flxbl-io/sfp/commit/9161f3fd9e239e4a92229bb7dd6c00ecf21212ee))
* **logs:** add addition info on dry run ([92e0905](https://github.com/flxbl-io/sfp/commit/92e0905511f824b3c9a2bbc75d97ac373debb939))
* **logs:** fix incorrect params for logs ([03a25ff](https://github.com/flxbl-io/sfp/commit/03a25ffeb0750b24c30fd0f38a66c02400d280e3))
* **logs:** refactor to use printHeader from sfpLogger ([4291e91](https://github.com/flxbl-io/sfp/commit/4291e9151164f998d9a4fec31f19f789c514ec85))
* **markdown:** ensure markdown files have config name when multiple releases are handled ([e201376](https://github.com/flxbl-io/sfp/commit/e201376f68a9c3d2052fe810d21bd86e052e372b))
* **metadatacount:** fix glob usage due to update of library ([e1464eb](https://github.com/flxbl-io/sfp/commit/e1464ebb7c0ae69f5033549bc6294181dc125d64))
* **metadatacount:** fix incorrect usage of new glob lib ([1634c11](https://github.com/flxbl-io/sfp/commit/1634c1135025e6deb594af5a1a3a82c0ea1cf85c))
* **metrics:** fix incorrect variable used in metrics ([549c334](https://github.com/flxbl-io/sfp/commit/549c334d05954650d8227f1582101fb79dd3f23b))
* **metrics:** revert prefix to sfpowerscripts in console log ([#50](https://github.com/flxbl-io/sfp/issues/50)) ([d48f6ae](https://github.com/flxbl-io/sfp/commit/d48f6aec30961cdbb174d198010435722ee39611))
* **metrics:** switch back to sfpowerscripts as prefix for backward maintainability ([dfff417](https://github.com/flxbl-io/sfp/commit/dfff417e1c3c9be181ab168c7d8984d18b178554))
* **namespace:** fix namespaces on reported class names ([#1365](https://github.com/flxbl-io/sfp/issues/1365)) ([f88f227](https://github.com/flxbl-io/sfp/commit/f88f22763053aba6c93fbe02c4d3b6a1b571f1f4))
* **org-info:** fix markdown file rendering in scratchorg org info mode ([2a664e5](https://github.com/flxbl-io/sfp/commit/2a664e5998a38187ebdb6123981091435332a348))
* **org-info:** fix markdown formatting ([db5b22a](https://github.com/flxbl-io/sfp/commit/db5b22aa8b6c475e1d03bdd12468806c4ee04295))
* **orginfo:** add addtional ticks to markdown ([920c1a4](https://github.com/flxbl-io/sfp/commit/920c1a4eb2be1becbb773b374654cb763245d625))
* **orginfo:** display login URL instead of instance URL for scratch orgs ([#1432](https://github.com/flxbl-io/sfp/issues/1432)) ([ccdc73f](https://github.com/flxbl-io/sfp/commit/ccdc73f398b950750878b4ddbd1e20400c8248dd))
* **orginfodisplayer:** fix commands used in org info displayer ([8a2a19d](https://github.com/flxbl-io/sfp/commit/8a2a19d2f4d5611a749eb16cf37ef858f5800704))
* **orginfo:** fix incorrect header used ([9568dd0](https://github.com/flxbl-io/sfp/commit/9568dd04f0d55047a38299370e9714867af6aa42))
* **org:** remove redundant authUrl ([f958146](https://github.com/flxbl-io/sfp/commit/f958146ac81c3fbbf8c9e9f5fe819e4651a7b24a))
* **output:** fix output when validation errors ([da88e75](https://github.com/flxbl-io/sfp/commit/da88e758adb7652dc3ad9ce76ebfe6cf89a44538))
* **packagediff:** fix packages being built when the path to package start with same structure ([#1423](https://github.com/flxbl-io/sfp/issues/1423)) ([1d31cd3](https://github.com/flxbl-io/sfp/commit/1d31cd3f4fb348e20ccff00662ff380adee9393e)), closes [#1396](https://github.com/flxbl-io/sfp/issues/1396)
* **package:** fix examples of package create commands ([0eed907](https://github.com/flxbl-io/sfp/commit/0eed9077767303eb0990acd06eafc835bb0f7475))
* **package:** install using v58.0 PackageInstallRequest parameters ([#1370](https://github.com/flxbl-io/sfp/issues/1370)) ([e0c728a](https://github.com/flxbl-io/sfp/commit/e0c728a2d024bee37bf5483831b847b70a0c08e0))
* **patch:** ensure path to artifact directory is correct ([#27](https://github.com/flxbl-io/sfp/issues/27)) ([489fe3b](https://github.com/flxbl-io/sfp/commit/489fe3b9eb995007f41f5ba81f7cee467fe3ea07))
* **permset:** fix deprecated command being used in assigning permset ([386990b](https://github.com/flxbl-io/sfp/commit/386990b3e26bb8b541fbd78700ecf1c40360aa83))
* **picklist-background:** add retry counter to picklist update ([#8](https://github.com/flxbl-io/sfp/issues/8)) ([a8a881b](https://github.com/flxbl-io/sfp/commit/a8a881b759ec151d763345a217a8e0428756a987))
* **picklist-decoding-issue:** decode values before update ([#1386](https://github.com/flxbl-io/sfp/issues/1386)) ([0ed7416](https://github.com/flxbl-io/sfp/commit/0ed74166b3aa26697bac9d166c3fb4688fc2771f))
* **picklist-support:** fix check for empty records on org ([#1341](https://github.com/flxbl-io/sfp/issues/1341)) ([25c7177](https://github.com/flxbl-io/sfp/commit/25c7177ba6fba9154e05881f91e1beefa936cd00))
* **picklist:** Cannot read properties of undefined (reading 'Metadata') ([65e36ee](https://github.com/flxbl-io/sfp/commit/65e36ee91bbb22eebb73795a5684ddd5cbf973cf))
* **picklist:** fix incorrect check for picklist if missing in org ([b26566c](https://github.com/flxbl-io/sfp/commit/b26566c6e3d95f6c8d3078fe9fa7e0b92d1b182d)), closes [#1414](https://github.com/flxbl-io/sfp/issues/1414)
* **picklist:** fix incorrect conflict resolution ([e596a54](https://github.com/flxbl-io/sfp/commit/e596a54903750d0a6debd70c3550072dcd3086ae))
* **picklist:** fix incorrect name used by picklist analyzer ([527d3fa](https://github.com/flxbl-io/sfp/commit/527d3fa6c816d1f34bc68fbe7b91b6816b75d4f4))
* **pool:** fixes pool org delete incorrect use of username ([00c4e27](https://github.com/flxbl-io/sfp/commit/00c4e27f0b9ccc244280b2c58e316a17dfcf55be)), closes [#1388](https://github.com/flxbl-io/sfp/issues/1388)
* **pool:** revert path used to .sfpowerscripts for backward compatibility ([625b39b](https://github.com/flxbl-io/sfp/commit/625b39bf62c46c11571d333ca8b094cc2f2f7a39))
* **prepare:** add standalone alias for easier migration in sfops ([621114c](https://github.com/flxbl-io/sfp/commit/621114c2e1ff03db7bbb23ae7d7d036bf32d2da7))
* **prepare:** fix incorrect path used in pooldefinition.schema.json ([250b97a](https://github.com/flxbl-io/sfp/commit/250b97ae1159255ba820ae90e359e0a058282c16))
* **profiles:** improved error messaging ([#1355](https://github.com/flxbl-io/sfp/issues/1355)) ([18ee7f5](https://github.com/flxbl-io/sfp/commit/18ee7f5c977b71c52d60c40edada7cd03d6a512b))
* **projectconfig:** incorrect use of package.name while filtering project config ([256c6bb](https://github.com/flxbl-io/sfp/commit/256c6bb308d741b8be22ff0ebbe038dad0595822))
* **promote:** align terminology of artifacts vs package in description ([b3d4653](https://github.com/flxbl-io/sfp/commit/b3d46536d4d8e34c2f246eeca5da44e17011c3b7))
* **publish:** fix artifact nomenclature used while publishing ([bd8e894](https://github.com/flxbl-io/sfp/commit/bd8e89497e6f0d6c4e2dc3256d2bcf24243f9492))
* **readme:** centre temporary ascii text ([9988c40](https://github.com/flxbl-io/sfp/commit/9988c408d14487451209573eac18df11b684562a))
* **README:** contributors link target dx@scale repo ([#1424](https://github.com/flxbl-io/sfp/issues/1424)) ([3ad788c](https://github.com/flxbl-io/sfp/commit/3ad788c9ee9351d11c4a9b9db7ba631f887d794b))
* **readme:** fix badges in readme ([4369aa9](https://github.com/flxbl-io/sfp/commit/4369aa94407ad17dcac8d712a3d58401e42495df))
* **readme:** fix dead links in readme ([fb5df37](https://github.com/flxbl-io/sfp/commit/fb5df3757fcffc93cd102784aa511997dfc0bca5)), closes [#1425](https://github.com/flxbl-io/sfp/issues/1425)
* **readme:** update license and readme ([d450bb6](https://github.com/flxbl-io/sfp/commit/d450bb6e9615a4d22d42c11442c2e1ba45ef9ea8))
* **release:** add additonal null check ([4d62bff](https://github.com/flxbl-io/sfp/commit/4d62bffc97d559a361500d7407beb53576ce0983))
* **releasedefn-generate:** Update example commands and typos ([#1431](https://github.com/flxbl-io/sfp/issues/1431)) ([b56ec85](https://github.com/flxbl-io/sfp/commit/b56ec858e549db3e99e7dc930e7be06f181e6cd2))
* **release:** do not sent metrics when its on dry run ([ed3dd5b](https://github.com/flxbl-io/sfp/commit/ed3dd5be4afd366d6c0d5e4f5c78af06e828d56d))
* **release:** ensure dependencies are not installed during dryun ([5c63448](https://github.com/flxbl-io/sfp/commit/5c634481fd27a1ab0cc484fe52ccb7ffff3d7c8b)), closes [#1340](https://github.com/flxbl-io/sfp/issues/1340)
* **release:** fix incorrect message description ([9d159e8](https://github.com/flxbl-io/sfp/commit/9d159e8e8a8eefa7abe4770b9f312826147c5ef2))
* **release:** make release defn flag mandatory ([8c02198](https://github.com/flxbl-io/sfp/commit/8c0219883f7db0e164a3a98f8fd596ab831880ea))
* **release:** use releaseconfig name to seperate out changelog creation rather than all ([533d932](https://github.com/flxbl-io/sfp/commit/533d932b4c02fd5bfbe651cda69a77b9fa20c9ce))
* remove dependency on @salesforce/core ([55fe4a2](https://github.com/flxbl-io/sfp/commit/55fe4a2dd96dca252680260ea587e2792312262d))
* remove logo temporarily ([7c96e58](https://github.com/flxbl-io/sfp/commit/7c96e588d5e5a55fca2146a00c8aa981909c4036))
* **schema:** update schema to remove warning around seedMetadata ([#1400](https://github.com/flxbl-io/sfp/issues/1400)) ([f686074](https://github.com/flxbl-io/sfp/commit/f686074f2017e04b27d46338a67ee3ebc28f166e)), closes [#1349](https://github.com/flxbl-io/sfp/issues/1349)
* **scope:** change scope to flxbl-io to reflect github username of the flxbl-io org ([704d891](https://github.com/flxbl-io/sfp/commit/704d891dddb208e01a70556a38e3208b14e76820))
* **sfdxauthurl:** fix  regex for sfdx validation ([#1394](https://github.com/flxbl-io/sfp/issues/1394)) ([1aae484](https://github.com/flxbl-io/sfp/commit/1aae484280b5441d2d4b2c6cb5b44e5360d846f1))
* **sfp:** fix commands help not getting displayed ([af46309](https://github.com/flxbl-io/sfp/commit/af46309a57efdd8fbca9c9daf4666b1ffaa1b38a))
* **sfp:** fix examples to demonstrate using -o shorthand notation ([45c1f55](https://github.com/flxbl-io/sfp/commit/45c1f55c6901c9010d495937ce46b0ee1f985136))
* **sfp:** fix incorrect var name used ([09d7733](https://github.com/flxbl-io/sfp/commit/09d7733a5676c6ed8f6e4af291ab863c57ebe975))
* **sfplogger:** fix truncation of logs with more accurate length using strip ansi ([63036c3](https://github.com/flxbl-io/sfp/commit/63036c3ddf0f19a6ff1efeca32073ffcc6801ccc))
* **sfplogger:** revert incorrect splitting ([53cb98f](https://github.com/flxbl-io/sfp/commit/53cb98f977ba2f10af011f29bafc70123dcf674f))
* **sfporg:** revert incorrect replacement of sfp artifact ([6172fe5](https://github.com/flxbl-io/sfp/commit/6172fe578545f9079c9530baa9ba670ccb6be464))
* **sfpPackage:** improved source repository validation ([#34](https://github.com/flxbl-io/sfp/issues/34)) ([6365196](https://github.com/flxbl-io/sfp/commit/6365196f0816e2c14705bfaab5535cbda58d213b))
* **sfppackage:** use tag__c in sfpowerscriptsArtifact2__c to store package type ([534bd4d](https://github.com/flxbl-io/sfp/commit/534bd4deabc889d5fde0db0d59f131ffa3f48399))
* **sfp:** revert file locations to use .sfpowerscripts ([28c7642](https://github.com/flxbl-io/sfp/commit/28c7642f00b3cde6b43fdb322046a99cbc13af4c))
* **sfp:** update header ([c28727a](https://github.com/flxbl-io/sfp/commit/c28727a5d63d40d59357312d6c4378e016a6a556))
* **tests:** fix import used in tests for glob ([3ead60e](https://github.com/flxbl-io/sfp/commit/3ead60e31431cbd3a900a5e984c9cc26ea9519bd))
* **triggerApexTests:** second test run results are not merged ([#1360](https://github.com/flxbl-io/sfp/issues/1360)) ([28e20e6](https://github.com/flxbl-io/sfp/commit/28e20e6f7cb19769290c506311e032ce3129357b))
* **typo:** Typos on user outputs and docs ([#58](https://github.com/flxbl-io/sfp/issues/58)) ([6279245](https://github.com/flxbl-io/sfp/commit/6279245148ffaf7ac78dd2bca6e6cef980bd1974))
* update action versions ([a3ede17](https://github.com/flxbl-io/sfp/commit/a3ede1738685cc7d5e1589d27f1688173b6041a6))
* update dependencies of sfprofiles ([cf29491](https://github.com/flxbl-io/sfp/commit/cf294913c915fe62792eec5a9bbb968c7a0a87ae))
* update jest ([e4a325e](https://github.com/flxbl-io/sfp/commit/e4a325e3c3323940cdbdf9a3fcbab0037611ffdb))
* update review template ([bc6e902](https://github.com/flxbl-io/sfp/commit/bc6e9027bb893954137a3bf836a03695ca94abbf))
* update to latest sf cli base image ([afe6203](https://github.com/flxbl-io/sfp/commit/afe62038d3238813098e8a9d75baf51848ae99e0))
* update to latest version of libs ([211448a](https://github.com/flxbl-io/sfp/commit/211448aacd8d16fe7aaa140c5fd0cae07ffb986c))
* **validate:** --installdeps flag was getting ignored in certain modes in validateAgainstOrg ([3fb9684](https://github.com/flxbl-io/sfp/commit/3fb968443ba4635e42dc4dc9771e9cd999934e34))
* **validate:** add missing flag targetdevhubusername ([f8fd3b8](https://github.com/flxbl-io/sfp/commit/f8fd3b8f7b08a04126faefd52cbc6b74c64979a0))
* **validate:** add summary on failed validation ([ceae703](https://github.com/flxbl-io/sfp/commit/ceae70364352e08a172098cd13b2fcf60417a777))
* **validateAgainstOrg:** fix incorrect path to message flag ([cad86ce](https://github.com/flxbl-io/sfp/commit/cad86ce2d3b5273737310b7c35b2a9984889e571))
* **validateAgainstOrg:** utilize array flags as opposed to string ([1b6bace](https://github.com/flxbl-io/sfp/commit/1b6bacecf3f507a9bac5030b9cdd4faee0495152))
* **validate:** commit packages only after test result is successfull ([44fa915](https://github.com/flxbl-io/sfp/commit/44fa91542c6f67426a68bb48a8e7b973a0cc1f0a))
* **validate:** correct flag var ([8152b0f](https://github.com/flxbl-io/sfp/commit/8152b0f83194afd133aa88400e3f0adace7ae29f))
* **validate:** ensure dependencyOn is respected ([616c637](https://github.com/flxbl-io/sfp/commit/616c63771e25a3833fd1aef560f38bbd63f012a2))
* **validate:** ensure deprecated flag is mentioned during run ([e292c20](https://github.com/flxbl-io/sfp/commit/e292c207152e44d9ca218ad335ef52460a23351c))
* **validate:** fix add additional package validations on override ([8026d97](https://github.com/flxbl-io/sfp/commit/8026d971a02135d68831947b0d0f2707052e77b4))
* **validate:** fix incorrect condition while packages are overriden ([5883ab6](https://github.com/flxbl-io/sfp/commit/5883ab640bc61c53bee90650c2bf13f21bcea531))
* **validate:** fix incorrect syntax and version ([4e81088](https://github.com/flxbl-io/sfp/commit/4e81088ce4351945d62ed6cc2085bb9ec0dea260))
* **validate:** fix old alias to have casing for validateAgainstOrg ([e1affe3](https://github.com/flxbl-io/sfp/commit/e1affe356cc85ad57e1f3ad11df327e11d16f1ce))
* **validate:** remove duplicate logging of inclusive filter ([52dda28](https://github.com/flxbl-io/sfp/commit/52dda286e6e1acdf25b3b04b34cbb269009e6ae6))
* **validate:** remove trailing braces of an escaped string ([4ef124d](https://github.com/flxbl-io/sfp/commit/4ef124df29c81bcad5dcfea5266d553a9f0550f7))
* **validate:** use correct flags and aliases ([88672bc](https://github.com/flxbl-io/sfp/commit/88672bc58681af7f27996ae044d37e0cc2211e6b))
* **validate:** validate should use the target org as the baseline ([340a95c](https://github.com/flxbl-io/sfp/commit/340a95c81e160108daab92fbc12a61aae820d036))
* **validate:** validate to always validate impacted packages ([66d2da3](https://github.com/flxbl-io/sfp/commit/66d2da3e8311c2ae6a89ae024ad5f9c0dabd0729))
* **various:** fix typo in flxbl.io url ([0cfbe9d](https://github.com/flxbl-io/sfp/commit/0cfbe9d32f47caf12c427f86c03bc1534efb955c))
* **WorkItemFilters:** Support multiple workItem filters ([#1429](https://github.com/flxbl-io/sfp/issues/1429)) ([ede7266](https://github.com/flxbl-io/sfp/commit/ede7266c4b97e4c133d5848ab3a79d66dbc38608))

## [38.6.1](https://github.com/flxbl-io/sfp/compare/v38.6.0...v38.6.1) (2024-06-29)


### Bug Fixes

* **cicd:** add a release-as next for the release configuration ([1dfc27c](https://github.com/flxbl-io/sfp/commit/1dfc27c2bc39820737150cedf0d3802c71c1efd9))
* **cicd:** update release please configs to draft ([b7a9a8c](https://github.com/flxbl-io/sfp/commit/b7a9a8ce59115da8d1f8a3071720245e6e16c86d))

## [38.6.0](https://github.com/flxbl-io/sfp/compare/v38.5.2...v38.6.0) (2024-06-29)


### Features

* **cicd:** simplify using release-please ([6312fdf](https://github.com/flxbl-io/sfp/commit/6312fdf43948265ece64cbb02d7c82098d64ff00))
* **docker:** update sfp cli version ([b631f2d](https://github.com/flxbl-io/sfp/commit/b631f2de5b2733d7d58ddb0541a7238b518d6a86))


### Bug Fixes

* **cicd:** switch to GITHUB_TOKEN ([841fd4a](https://github.com/flxbl-io/sfp/commit/841fd4a555fac811c785592538d35693663be745))
