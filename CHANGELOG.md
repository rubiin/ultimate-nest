# Changelog

## [2.6.0](https://github.com/rubiin/ultimate-nest/compare/v2.5.0...v2.6.0) (2024-08-19)


### Features

* add isBooleanField decorator ([49bd9c1](https://github.com/rubiin/ultimate-nest/commit/49bd9c13485db404e88e20a561ddf7deeed1df2b))
* add log files ([7fae51b](https://github.com/rubiin/ultimate-nest/commit/7fae51b7c46d5a27d1e9365fddf2f478337e022e))
* add nested validator ([99a150a](https://github.com/rubiin/ultimate-nest/commit/99a150ae1a7f029f3c6323980c9554a8ca39c020))
* add option to keep original file name in aws s3 ([d57e668](https://github.com/rubiin/ultimate-nest/commit/d57e668c6e9f518e72c6d4087759bcd297275b5e))
* add pool listeners ([4ec4c0e](https://github.com/rubiin/ultimate-nest/commit/4ec4c0ecf2891c01e13ca45aad1e618772eb8f48))
* add quick-migrate justfile command ([7b828b4](https://github.com/rubiin/ultimate-nest/commit/7b828b4eabb1632a4b4d4d26ec0e3e3225746b3f))
* add referral ([484967d](https://github.com/rubiin/ultimate-nest/commit/484967d34a0cc7700ffbeef22d886632e71ea2ba))
* aws s3 module allows all options ([50a7210](https://github.com/rubiin/ultimate-nest/commit/50a7210f55fba545ab72aed334da66a6658ebf29))
* eslint flat config ([fce475f](https://github.com/rubiin/ultimate-nest/commit/fce475fcd3852eca7fc1ffd997a3fea5f6724465))
* eslint to cjs ([477d431](https://github.com/rubiin/ultimate-nest/commit/477d431acf4aa4db2779c9f1124248b01824fdc9))
* export request, response to global namespace , read comment on why ([6e67466](https://github.com/rubiin/ultimate-nest/commit/6e674664d5f9dcc2ed133a4401007c8461538e0b))
* express brotli compress and traeffik ([4ce5050](https://github.com/rubiin/ultimate-nest/commit/4ce5050b419335fd7d0b901a379018141dfeb93c))
* **file:** Add ApiFileResponse decorator for file downloads ([8b55cd5](https://github.com/rubiin/ultimate-nest/commit/8b55cd5374dea263c52c5a023c2139f5e8c4a104))
* observable in aws s3 ([62fb6fd](https://github.com/rubiin/ultimate-nest/commit/62fb6fd77ef00fe6c705caa7789322192912cb2f))
* origin decorator, min/max date ([ac379dd](https://github.com/rubiin/ultimate-nest/commit/ac379dd7c22154cd96613938314e69c2dc8c81c0))
* rabbitmq health check ([9779e82](https://github.com/rubiin/ultimate-nest/commit/9779e829b7df0536ce03e6d3b4e0fc6f6c10c9cf))
* simple fixes to crud module ([f23707f](https://github.com/rubiin/ultimate-nest/commit/f23707f106b7daa464ada5345296553729c3498d))
* typesafe comparision decorator ([a1c2914](https://github.com/rubiin/ultimate-nest/commit/a1c2914725c04e421995462ea5a059f7aedc2a4b))
* use rabbitmq image with delayed plugin ([905ff26](https://github.com/rubiin/ultimate-nest/commit/905ff266015a07c59c263de244962ba1814cd0ca))
* vscode settings ([6b17b26](https://github.com/rubiin/ultimate-nest/commit/6b17b26444fec9513b822c2e6fcc9e60cd8f4bbf))


### Bug Fixes

* add custom file validation msg for filesize ([acb84f7](https://github.com/rubiin/ultimate-nest/commit/acb84f7e9a0e3a8be1c7ea246b1ecb3298a0f055))
* add indexes for faster query ([eae7e27](https://github.com/rubiin/ultimate-nest/commit/eae7e272a73a9870417ab1a3f7a4dcc33106fccb))
* add ioredis ([4418e80](https://github.com/rubiin/ultimate-nest/commit/4418e80578453e2ca6961e77386eedece082f401))
* add more unicorn rules ([02eddc9](https://github.com/rubiin/ultimate-nest/commit/02eddc98201244e1a152d7585aa0783248197d04))
* add promise related config ([5441e55](https://github.com/rubiin/ultimate-nest/commit/5441e551a3fe4a3d6d43db931416ef4fe38cfc0f))
* add quote style ([59abdf9](https://github.com/rubiin/ultimate-nest/commit/59abdf9e5d1ffc59c2448ae9660cedd3117e1cb3))
* add swagger dark css ([fa8b6fe](https://github.com/rubiin/ultimate-nest/commit/fa8b6fe42822e7e21a1489df8b92f17b6e542b39))
* add type checked rules ([742114a](https://github.com/rubiin/ultimate-nest/commit/742114accaa1f4ed4b8541be9943f10a9121b18a))
* add typesafety for dateFomat validator ([6b954f7](https://github.com/rubiin/ultimate-nest/commit/6b954f77af2912f02aac47958163e36c00c2548e))
* add web,svg as valid image format ([115958c](https://github.com/rubiin/ultimate-nest/commit/115958cddad70898b20f4fedd4937e3cd616e0b9))
* add web,svg as valid image format ([b9f5cd9](https://github.com/rubiin/ultimate-nest/commit/b9f5cd9481c63c49b0c90bf7f008f17602d58f92))
* adjust function calls to use correct arguments ([d8b59dc](https://github.com/rubiin/ultimate-nest/commit/d8b59dcbd952c55b001d639f9f6f0ae1dfd2e313))
* async style for pino and i18n module ([ef86e2e](https://github.com/rubiin/ultimate-nest/commit/ef86e2eae985488851f0860d88dd088f93540b1a))
* automate swagger fields from pkg ([ddc795d](https://github.com/rubiin/ultimate-nest/commit/ddc795d944098b3eddad9563dc0cd86cd9f7240b))
* clister config ([51c9616](https://github.com/rubiin/ultimate-nest/commit/51c9616edea508559ff141c19980a5634f315352))
* compose file ([a0ecf14](https://github.com/rubiin/ultimate-nest/commit/a0ecf14cf1a2789e9b9cb2e13baa53c6bfd0fbb7))
* compose file ([70647ad](https://github.com/rubiin/ultimate-nest/commit/70647ad041cd13073ecad1356ef19b8a892d26ef))
* concurrency options for pool ([88d56bf](https://github.com/rubiin/ultimate-nest/commit/88d56bf3450509273522ea44356181f90213e05e))
* convert promises to async ([c695f62](https://github.com/rubiin/ultimate-nest/commit/c695f624866d4f8458e0e6970d999b61926bfe1d))
* custom ladjs/consolidate typings as there is no types with the name for now ([4f4082f](https://github.com/rubiin/ultimate-nest/commit/4f4082fe4495d62a70b1c50450cc36c51971116e))
* custom message for  file format validation ([cb54625](https://github.com/rubiin/ultimate-nest/commit/cb546251be359f096083b2218f9329967d90f076))
* **deps:** update all major deps ([e427cfc](https://github.com/rubiin/ultimate-nest/commit/e427cfc9f5bf1409f43fece0d2d83e081c329abd))
* **deps:** update all major deps ([478f7ab](https://github.com/rubiin/ultimate-nest/commit/478f7abb354041d6ab476621f450705e0e1c20df))
* **deps:** update all non-major dependencies ([d94d50c](https://github.com/rubiin/ultimate-nest/commit/d94d50c4174abbb40f4f0da82cd44f9775342eca))
* **deps:** update all non-major dependencies ([4f1fb10](https://github.com/rubiin/ultimate-nest/commit/4f1fb1050cef213ad5dcdea9f25b52320ba4c258))
* **deps:** update all non-major dependencies ([1b55f63](https://github.com/rubiin/ultimate-nest/commit/1b55f6302d82043f4080569d963e642aee8efb38))
* **deps:** update all non-major dependencies ([4a4657e](https://github.com/rubiin/ultimate-nest/commit/4a4657e628c92631451438cb087658cb305baad9))
* **deps:** update all non-major dependencies ([2dff84e](https://github.com/rubiin/ultimate-nest/commit/2dff84e37de38f76b40d3bec7f571cb9804cde8b))
* **deps:** update all non-major dependencies ([6a2fe0d](https://github.com/rubiin/ultimate-nest/commit/6a2fe0d88abdb7eab546623e6d352990418426f6))
* **deps:** update all non-major dependencies ([71f8b03](https://github.com/rubiin/ultimate-nest/commit/71f8b0328a004728baec1479750f4e15da3e918b))
* **deps:** update all non-major dependencies ([adae9ca](https://github.com/rubiin/ultimate-nest/commit/adae9cab1960cf4208d9b5ee177ff78c21e73df4))
* **deps:** update all non-major dependencies ([bab977f](https://github.com/rubiin/ultimate-nest/commit/bab977fc98ef2487144e57838d1e00a2dfbbc7b4))
* **deps:** update all non-major dependencies ([7a92023](https://github.com/rubiin/ultimate-nest/commit/7a920237450d1379d25ec7f8cee36e8d366111ca))
* **deps:** update all non-major dependencies ([74aceac](https://github.com/rubiin/ultimate-nest/commit/74aceace0bf14a001d091bca2737c9a2d939e5e8))
* **deps:** update all non-major dependencies ([96b2dba](https://github.com/rubiin/ultimate-nest/commit/96b2dbac33d9ed1f822bbe8985e2550cfaf0839a))
* **deps:** update all non-major dependencies ([d5586cd](https://github.com/rubiin/ultimate-nest/commit/d5586cdf9c2488ff1e55557abe6d8413d157f7be))
* **deps:** update all non-major dependencies ([918c42f](https://github.com/rubiin/ultimate-nest/commit/918c42fae0d2536c3201d52ceea3e751bfb2b72c))
* **deps:** update all non-major dependencies ([9606da0](https://github.com/rubiin/ultimate-nest/commit/9606da0014eb18ab136798768bd2cca10b9337d2))
* **deps:** update all non-major dependencies ([26b03db](https://github.com/rubiin/ultimate-nest/commit/26b03dbf4c0af5d4790f9faa4a64b503f8e19d03))
* **deps:** update all non-major dependencies ([cb3edad](https://github.com/rubiin/ultimate-nest/commit/cb3edadd615a919eb06f2c9b3b671b099a5db929))
* **deps:** update all non-major dependencies ([3e091e1](https://github.com/rubiin/ultimate-nest/commit/3e091e19beda649aec9b43d8d60f955eae07d89c))
* **deps:** update all non-major dependencies ([25fb25a](https://github.com/rubiin/ultimate-nest/commit/25fb25afdd2d11dbaa20491abd0e2865fb60074d))
* **deps:** update all non-major dependencies ([bb0a2a4](https://github.com/rubiin/ultimate-nest/commit/bb0a2a417a42360bda8c5fac9e6e5c49a988d348))
* **deps:** update all non-major dependencies ([822b1c9](https://github.com/rubiin/ultimate-nest/commit/822b1c9b1d69d5a9a080abc0c82060e8f6082231))
* **deps:** update all non-major dependencies ([4a1d351](https://github.com/rubiin/ultimate-nest/commit/4a1d35184bc17fda913d960c41f70028bfd74d02))
* **deps:** update all non-major dependencies ([2bb409c](https://github.com/rubiin/ultimate-nest/commit/2bb409cbac71bd8db376b73818d6461dfaf6d0e0))
* **deps:** update all non-major dependencies ([8a28bbd](https://github.com/rubiin/ultimate-nest/commit/8a28bbdfad5325f6e3deed24c26d2a480b0c05e4))
* **deps:** update all non-major dependencies ([e2c5326](https://github.com/rubiin/ultimate-nest/commit/e2c5326fc01bbc0814545b31a6e522328e1a12ce))
* **deps:** update all non-major dependencies ([e221d28](https://github.com/rubiin/ultimate-nest/commit/e221d28c8a74a38e570dbfd305f9ab4b8ae79c88))
* **deps:** update all non-major dependencies ([25a2d07](https://github.com/rubiin/ultimate-nest/commit/25a2d07899227e8eeac03eaefb5c618f24f4990a))
* **deps:** update all non-major dependencies ([877534a](https://github.com/rubiin/ultimate-nest/commit/877534a5d1b2d8c65688c8ab3139f5af0c3a775a))
* **deps:** update all non-major dependencies ([22fce0b](https://github.com/rubiin/ultimate-nest/commit/22fce0bf23712a17ca81a2b8e4dc35e8aac89be1))
* **deps:** update all non-major dependencies ([6d02845](https://github.com/rubiin/ultimate-nest/commit/6d0284501a025cab57f778f14b3981045c655365))
* **deps:** update all non-major dependencies ([2a56013](https://github.com/rubiin/ultimate-nest/commit/2a56013536de1131b9989572be912e5a358503ac))
* **deps:** update all non-major dependencies ([1553c5a](https://github.com/rubiin/ultimate-nest/commit/1553c5a7b286eedd53f29ea9d637b7707e5d8aca))
* **deps:** update all non-major dependencies ([82ad390](https://github.com/rubiin/ultimate-nest/commit/82ad390edba087736122c47f468c1d31c9398be6))
* **deps:** update all non-major dependencies to ^3.564.0 ([4c40367](https://github.com/rubiin/ultimate-nest/commit/4c403675d572b654a9f93764920fc6663c78336f))
* **deps:** update all non-major dependencies to ^7.112.1 ([7d304fe](https://github.com/rubiin/ultimate-nest/commit/7d304fe5fd0c21bf27a4d8617e3d849135870793))
* **deps:** update all non-major deps ([4786042](https://github.com/rubiin/ultimate-nest/commit/478604214544abb1fedfb003f94dfa9b6bc7c376))
* **deps:** update all non-major deps ([5be8298](https://github.com/rubiin/ultimate-nest/commit/5be8298c6034ac6f92b0d3a43f930ddf4d0125cd))
* **deps:** update all non-major deps ([e3093c4](https://github.com/rubiin/ultimate-nest/commit/e3093c47ed098f1b5d70f8af47c3eb03803bf4ad))
* **deps:** update all non-major deps ([cac4f4c](https://github.com/rubiin/ultimate-nest/commit/cac4f4c0197bd9630cb71f5d40e574e802435df6))
* **deps:** update all non-major deps ([e1ec91f](https://github.com/rubiin/ultimate-nest/commit/e1ec91ff083eb45bafaeb870da0f2cd411cefdaa))
* **deps:** update all non-major deps ([e3272e4](https://github.com/rubiin/ultimate-nest/commit/e3272e47751dd8157a7487290a948c4e9f7367bd))
* **deps:** update all non-major deps ([8786629](https://github.com/rubiin/ultimate-nest/commit/8786629ec622947caeff911f3697cc61626f73b5))
* **deps:** update all non-major deps ([fff08d8](https://github.com/rubiin/ultimate-nest/commit/fff08d80f48faf7d68cb38462bd31219531c175d))
* **deps:** update all non-major deps ([ed0f638](https://github.com/rubiin/ultimate-nest/commit/ed0f638f670487396e9779a4f52f990b669ec5fc))
* **deps:** update all non-major deps ([183339e](https://github.com/rubiin/ultimate-nest/commit/183339e942aab07acce62d193749e387b4339ec2))
* **deps:** update all non-major deps ([86eaeb7](https://github.com/rubiin/ultimate-nest/commit/86eaeb7f0ab980900862fab458400ddff452370d))
* **deps:** update all non-major deps ([62ef357](https://github.com/rubiin/ultimate-nest/commit/62ef35796e63472c6b0246b14c54339ecec434be))
* **deps:** update all non-major deps ([928760a](https://github.com/rubiin/ultimate-nest/commit/928760a991a386ee6c41f3f1bb2bef4a1e5628f4))
* **deps:** update all non-major deps ([3dac669](https://github.com/rubiin/ultimate-nest/commit/3dac669078eb38e4723092102f0ab8a21584a4c8))
* **deps:** update dependency @golevelup/nestjs-rabbitmq to v5 ([08d71a3](https://github.com/rubiin/ultimate-nest/commit/08d71a3b0ffc4ba5e79a343eee71211d595d9038))
* **deps:** update dependency @mikro-orm/nestjs to v6 ([2d61d1a](https://github.com/rubiin/ultimate-nest/commit/2d61d1a8566432d2e47c0e55994375124fd19655))
* **deps:** update dependency @nestjs/throttler to v6 ([22c7648](https://github.com/rubiin/ultimate-nest/commit/22c76483b16d79f2085fc110f5b87136ed0e8213))
* **deps:** update dependency date-fns-tz to v3 ([b86b84b](https://github.com/rubiin/ultimate-nest/commit/b86b84b42ec08c45d517e7fb3daa8b9a44b3f508))
* **deps:** update dependency isomorphic-dompurify to ^2.8.0 ([36fb0d2](https://github.com/rubiin/ultimate-nest/commit/36fb0d22a257299708bde1c6b0b626bef16d72f1))
* **deps:** update dependency nestjs-pino to v4 ([a1e7d2e](https://github.com/rubiin/ultimate-nest/commit/a1e7d2ea963965f2e4e7c4a9b80e78235a68a083))
* **deps:** update dependency nodemailer to ^6.9.9 ([59780b0](https://github.com/rubiin/ultimate-nest/commit/59780b0f4d1cdbd2be4aee466bc4209a8174f675))
* **deps:** update dependency pino-http to v10 ([de60001](https://github.com/rubiin/ultimate-nest/commit/de600014184c3b40e7d588bf209e5f3769f929d9))
* **deps:** update dependency pino-http to v9 ([f184016](https://github.com/rubiin/ultimate-nest/commit/f184016232f642cdbe5660d3813b8403de6703e4))
* **deps:** update dependency poolifier to ^4.0.9 ([fa702ca](https://github.com/rubiin/ultimate-nest/commit/fa702ca8307d83bba0a0dab755804ec914a4c355))
* **deps:** update dependency poolifier to v2.6.24 ([bdab5c0](https://github.com/rubiin/ultimate-nest/commit/bdab5c0af47fac900b6f8df510360d4aeb39a8d8))
* **deps:** update dependency poolifier to v4 ([53f91ff](https://github.com/rubiin/ultimate-nest/commit/53f91ffdec02a255952900d5d624d3dda62c5362))
* **deps:** update dependency stripe to v15 ([5ffc78d](https://github.com/rubiin/ultimate-nest/commit/5ffc78d0520afe2f28bd647e80518630f51d7807))
* **deps:** update dependency stripe to v16 ([bc58631](https://github.com/rubiin/ultimate-nest/commit/bc58631c82cc368b41f8e2fa5b9575a067e94af7))
* **deps:** update dependency twilio to v4.14.0 ([2af281c](https://github.com/rubiin/ultimate-nest/commit/2af281c26153e8c900a88ff024a13a4d58e65054))
* **deps:** update dependency twilio to v5 ([7b54fb5](https://github.com/rubiin/ultimate-nest/commit/7b54fb5cd107d188e029cdc5871843790602f352))
* **deps:** update nest monorepo to v10.1.0 ([1474e77](https://github.com/rubiin/ultimate-nest/commit/1474e7763b2f68d3a9538736e89ae89d13d40d55))
* **deps:** update sentry-javascript monorepo to v8 ([3e88362](https://github.com/rubiin/ultimate-nest/commit/3e883624d084103ab7e9a2a72750ca3c0eb85cec))
* docker and stuffs ([3601c83](https://github.com/rubiin/ultimate-nest/commit/3601c83ba3a9f6c33f7d91297d777940e334ef93))
* docker compose env ([7151bb3](https://github.com/rubiin/ultimate-nest/commit/7151bb350f8e761e393a5d12ecba30a9268c99ee))
* **docker:** use lts node docker image ([a5ad90c](https://github.com/rubiin/ultimate-nest/commit/a5ad90cf62395cac468f8605de7064e0302a8b14))
* dont include stripe by default ([17bfba9](https://github.com/rubiin/ultimate-nest/commit/17bfba93ae1d427f51fe6e153f91134e233a5790))
* dynamic threads with dynamic minmax ([4a39640](https://github.com/rubiin/ultimate-nest/commit/4a3964064000b8136f3d48eaea7d7ab032d6445a))
* dynamic worker file ([ff481de](https://github.com/rubiin/ultimate-nest/commit/ff481de91b5e2475e2acccfe07fe89b112962ef6))
* editorconfig for jsutfile and other defaults ([30fa935](https://github.com/rubiin/ultimate-nest/commit/30fa935e930924464a4b6d90dedf350a215420ef))
* eslint ([92544ce](https://github.com/rubiin/ultimate-nest/commit/92544ce6c1326d92651a0207128ba9358df08091))
* eslint chnages ([7bdb322](https://github.com/rubiin/ultimate-nest/commit/7bdb3220dd16554f0f7e2d5b8a63ff0419f93a74))
* eslint comment ([76ee3a1](https://github.com/rubiin/ultimate-nest/commit/76ee3a1fe70fafdbeb94d5758fd17d95cad2191d))
* eslint extends elsint-config-rubiin ([b886817](https://github.com/rubiin/ultimate-nest/commit/b886817ec65d0be13d64e28ef086db7fa7001c78))
* eslint override ([453059a](https://github.com/rubiin/ultimate-nest/commit/453059aef407f45da350bd4ea4d83e162f0fee09))
* extract mikros entity type to separate types ([db3a473](https://github.com/rubiin/ultimate-nest/commit/db3a473fad5b8b51c839c06d1b12000f35f643ca))
* extract mikros entity type to separate types ([db3a473](https://github.com/rubiin/ultimate-nest/commit/db3a473fad5b8b51c839c06d1b12000f35f643ca))
* faker update ([6d59c9d](https://github.com/rubiin/ultimate-nest/commit/6d59c9d1d0eefc1f5e1b4e365c78179932179c1e))
* filetype detection on upload ([396287d](https://github.com/rubiin/ultimate-nest/commit/396287d19c23e0e7d0a18f8f04d6867961a51988))
* filetype detection on upload ([96b2dba](https://github.com/rubiin/ultimate-nest/commit/96b2dbac33d9ed1f822bbe8985e2550cfaf0839a))
* fix pnpm ([74c1be5](https://github.com/rubiin/ultimate-nest/commit/74c1be54b6a403b6984cdbd8606f796a864ccc14))
* fix wrong function call ([692a8e3](https://github.com/rubiin/ultimate-nest/commit/692a8e3e19204484c99528a48a499ee7146a5ab6))
* getEntityName implementation ([bbd3abc](https://github.com/rubiin/ultimate-nest/commit/bbd3abc4afc00e3bb7c9b776bcbe8553e2dbb60a))
* getMime returns extension if not found ([f3fcc28](https://github.com/rubiin/ultimate-nest/commit/f3fcc28643234033f1b998edd810d7e2e452f3cf))
* i18n translate function ([64d98fc](https://github.com/rubiin/ultimate-nest/commit/64d98fcb6b33e4eefc07b730a72d9286063e0d35))
* improved code style ([6bc873f](https://github.com/rubiin/ultimate-nest/commit/6bc873fd2f43540726d5eb45a47324cc231581db))
* improved code style ([b37231f](https://github.com/rubiin/ultimate-nest/commit/b37231f9a39f25e8c4d1dc98f725bff136c1c6a1))
* issues with configs ([bfa3273](https://github.com/rubiin/ultimate-nest/commit/bfa327354627edf3ca3e1f0f22ceed506faef119))
* jsdoc and eslint ([033a638](https://github.com/rubiin/ultimate-nest/commit/033a6382d353dfb82e0530c442ede69afb723d20))
* jsdoc and lints ([f80e0ad](https://github.com/rubiin/ultimate-nest/commit/f80e0adf35cc5e25953f81f50129130f24d51475))
* jwt algorithm config ([fd0a333](https://github.com/rubiin/ultimate-nest/commit/fd0a333df36425eda46b662be0fab1dfcbc2e8bb))
* lint ([066f98e](https://github.com/rubiin/ultimate-nest/commit/066f98ee699826b83f58c04b4905a7d3039fbc5b))
* lint ([8525d9b](https://github.com/rubiin/ultimate-nest/commit/8525d9b0a474e5b55bb3aeaa124d710b587ff364))
* lint ([a6a881a](https://github.com/rubiin/ultimate-nest/commit/a6a881a15d9289f57c6b5f499509449427fd72a8))
* lock file ([5376d12](https://github.com/rubiin/ultimate-nest/commit/5376d12b0bc6f08c34f8eff1348de8411d234801))
* make emails lowercase ([e4eb6a2](https://github.com/rubiin/ultimate-nest/commit/e4eb6a248100ceb24fbf47d897c56191d13bc22e))
* migration config fixes added ([57eb5b9](https://github.com/rubiin/ultimate-nest/commit/57eb5b9b816e8828d0db706d9554becb5e38e5be))
* mikro changes ([daf9186](https://github.com/rubiin/ultimate-nest/commit/daf9186a589ff18866d6ce9723a25778b5f4705f))
* mikro request context ([0ba5434](https://github.com/rubiin/ultimate-nest/commit/0ba5434404944f066d9ffd481e98ffe0f8cc7f1b))
* mikroorm config change ([5a30d13](https://github.com/rubiin/ultimate-nest/commit/5a30d13fdc7760ec65e6ffd242dfb3091f5bceaf))
* mimetype issue ([d88675c](https://github.com/rubiin/ultimate-nest/commit/d88675c3f5a789edc2d4f6f8819aa18751974b99))
* move db config to separate file and cli to separate ([e0a1bd5](https://github.com/rubiin/ultimate-nest/commit/e0a1bd5fdd5fde11b3884c657fac152936efe467))
* move to antfu eslint ([d94c791](https://github.com/rubiin/ultimate-nest/commit/d94c7917705cf5a7ca17fb231cb2cfa03d654ee0))
* move traefik config to file ([50d2dd4](https://github.com/rubiin/ultimate-nest/commit/50d2dd42137dc92fbc82f85be85e9d831a1a4875))
* new deps ([3843e13](https://github.com/rubiin/ultimate-nest/commit/3843e13ea3ddfd92fc46106764ee001ab023df91))
* new nodejs version ([34bf546](https://github.com/rubiin/ultimate-nest/commit/34bf54650a2faaf206ea48a045eef76ee20748d7))
* optional chaining on custom libs ([ffd0baa](https://github.com/rubiin/ultimate-nest/commit/ffd0baa911a55b940a0273cf8a74a12bfdf3ba2b))
* optional chains on min.max lenghth ([177d094](https://github.com/rubiin/ultimate-nest/commit/177d094d286501b955a9eae7382fc75984b46aaa))
* optional option ([c387f96](https://github.com/rubiin/ultimate-nest/commit/c387f96c77a7f89527161cb048d312179c3cc9a2))
* pkg update ([760207f](https://github.com/rubiin/ultimate-nest/commit/760207fd4a76c197a268a46edaf85dd40008e0ad))
* poolifier new syntax for workers ([90cf1ea](https://github.com/rubiin/ultimate-nest/commit/90cf1ea0ac176e3222cb317bbafd7e434377e644))
* queue should use only one routing key ([ba2c8b1](https://github.com/rubiin/ultimate-nest/commit/ba2c8b1563647512e9b0ed62b396547b8ca07726))
* reference entity ([4a6d0e7](https://github.com/rubiin/ultimate-nest/commit/4a6d0e78ab7c7f87000c94bbb5fc2542ceeb12b0))
* remove axios overide ([bff248d](https://github.com/rubiin/ultimate-nest/commit/bff248d8c3240bbef7df0ca9f6d4723f4d7aa71e))
* remove formatSearch in favor of helper-fns ([fd0577b](https://github.com/rubiin/ultimate-nest/commit/fd0577bfe1fceb3a0b2a5b8361cdd59aa1045458))
* remove old config ([bc6d367](https://github.com/rubiin/ultimate-nest/commit/bc6d367a35d9c2efc9d4ed749b17eb5efef143e9))
* remove otp leak ([61ee20c](https://github.com/rubiin/ultimate-nest/commit/61ee20c3957a0a1070c3c868b15845afdbd5bfa3))
* remove saltlength on argon ([aa35b0d](https://github.com/rubiin/ultimate-nest/commit/aa35b0d5e19f82e1f10d10b6d590480ef6e489fa))
* remove traefik health check ([f9082ef](https://github.com/rubiin/ultimate-nest/commit/f9082ef973e58ec6f8bd6e9094965d89aefe79da))
* remove unneeded eslint packages ([0fcfb5a](https://github.com/rubiin/ultimate-nest/commit/0fcfb5ad2c7afe2f8197b24fb78aa835d2f5080f))
* renamed decorators ([eb4e968](https://github.com/rubiin/ultimate-nest/commit/eb4e968c38321bbe9b7671ec91e7289e2a1c3bb6))
* replace jests deprecated method ([c10848d](https://github.com/rubiin/ultimate-nest/commit/c10848d24e7900f99ea006d03baf9397215bd236))
* security feature policy ([07113e1](https://github.com/rubiin/ultimate-nest/commit/07113e14dd8a52d95e1b46ed1906d1bef7043202))
* security headers ([e37f78d](https://github.com/rubiin/ultimate-nest/commit/e37f78df17ae1ff01a8f3423cff6feac314da66d))
* seed-fresh script infavor of clean db ([9c8a16d](https://github.com/rubiin/ultimate-nest/commit/9c8a16d2817d3d8a65a9628eca48e8ed8f72b954))
* sentry config ([2dedd0d](https://github.com/rubiin/ultimate-nest/commit/2dedd0d402f529b2aada238d9cd265911d28c919))
* some lint rules ([4cd0526](https://github.com/rubiin/ultimate-nest/commit/4cd05260503005a006e76e8768467344e68f028b))
* sonar lint issues ([c6e4b24](https://github.com/rubiin/ultimate-nest/commit/c6e4b244d3abff119a7b71a004bbcda6745b027d))
* **spell:** spell issues and file names ([838d731](https://github.com/rubiin/ultimate-nest/commit/838d73165c2148a0cef2b1f5952e3196e102fd63))
* split process.env globals into separate file ([875690c](https://github.com/rubiin/ultimate-nest/commit/875690cd1409b91a6e233e683d94eafefdd9694d))
* stricter types and conditionals ([a435387](https://github.com/rubiin/ultimate-nest/commit/a4353873de3dfb4afaa54cf869a20704b300cfcf))
* **traefik:** response latency ([f4786b6](https://github.com/rubiin/ultimate-nest/commit/f4786b6dea6f76188404e73d2e0eb65b86e47d37))
* ts strict ([5e3c36a](https://github.com/rubiin/ultimate-nest/commit/5e3c36abe5f139c36eeadc3466215874473005cd))
* tsconfig ([422e40f](https://github.com/rubiin/ultimate-nest/commit/422e40f6e743dabdc07de332a5a171e1c5032339))
* tsconfig paths ([e268538](https://github.com/rubiin/ultimate-nest/commit/e268538a615b5b49d66c865d74e1c8b6798f47a6))
* type assertions ([968edc4](https://github.com/rubiin/ultimate-nest/commit/968edc44ecbff1a7979276f4ab9b508741649eee))
* type changes ([99d6def](https://github.com/rubiin/ultimate-nest/commit/99d6def678e84d332d2fbec760c8ba976b89053c))
* typeroot ([210da19](https://github.com/rubiin/ultimate-nest/commit/210da191683bf649aedb27cdf54cefe891d72ff2))
* typings ([4bd8833](https://github.com/rubiin/ultimate-nest/commit/4bd88338527225f3e8a10afd8b699cf2b4c01acf))
* typo ([e603108](https://github.com/rubiin/ultimate-nest/commit/e60310809794a4e5b0b675c77e1f7eaaf51523ff))
* unwanted type check ([b8c67e3](https://github.com/rubiin/ultimate-nest/commit/b8c67e323b43fed5f96eaf2095b378da37cff3fb))
* update nvm ([e70b99e](https://github.com/rubiin/ultimate-nest/commit/e70b99e5b0f75d65442ddb8194c2d34f6f542cf1))
* use consolidate for mail templating ([137b5ac](https://github.com/rubiin/ultimate-nest/commit/137b5acd94afd78e66c460c6267fcf4375726919))
* use eslint to format ts,js,json,md and yml, goodbye prettier ([5941ee4](https://github.com/rubiin/ultimate-nest/commit/5941ee46714e7e3e1efb6a51adfc963eb5ae32ce))
* use mikroorm new opt type ([7f283bf](https://github.com/rubiin/ultimate-nest/commit/7f283bf2e1cf2a70b9f2794c756e026be49097c9))
* **ws.guard:** translate exception messages ([7575676](https://github.com/rubiin/ultimate-nest/commit/757567694a8d8b38f2bd8aa2e6810bc7f82b2e20))
* zonedTime ([2ef5cb6](https://github.com/rubiin/ultimate-nest/commit/2ef5cb6fb3c1890abb0e938d96d9d17265b346a1))

## [2.5.0](https://github.com/rubiin/ultimate-nest/compare/v2.4.12...v2.5.0) (2024-08-12)


### Features

* use rabbitmq image with delayed plugin ([905ff26](https://github.com/rubiin/ultimate-nest/commit/905ff266015a07c59c263de244962ba1814cd0ca))


### Bug Fixes

* move traefik config to file ([50d2dd4](https://github.com/rubiin/ultimate-nest/commit/50d2dd42137dc92fbc82f85be85e9d831a1a4875))

## [2.5.0](https://github.com/rubiin/ultimate-nest/compare/v2.4.12...v2.5.0) (2024-07-31)


### Features

* use rabbitmq image with delayed plugin ([12b256f](https://github.com/rubiin/ultimate-nest/commit/12b256f4b7138d2b6ff179e37bb293f8f4c84ddf))

## [2.4.12](https://github.com/rubiin/ultimate-nest/compare/v2.4.11...v2.4.12) (2024-07-15)


### Bug Fixes

* **deps:** update all non-major dependencies ([d94d50c](https://github.com/rubiin/ultimate-nest/commit/d94d50c4174abbb40f4f0da82cd44f9775342eca))
* **deps:** update dependency @nestjs/throttler to v6 ([22c7648](https://github.com/rubiin/ultimate-nest/commit/22c76483b16d79f2085fc110f5b87136ed0e8213))
* **deps:** update dependency stripe to v16 ([bc58631](https://github.com/rubiin/ultimate-nest/commit/bc58631c82cc368b41f8e2fa5b9575a067e94af7))

## [2.4.11](https://github.com/rubiin/ultimate-nest/compare/v2.4.10...v2.4.11) (2024-06-17)


### Bug Fixes

* dont include stripe by default ([17bfba9](https://github.com/rubiin/ultimate-nest/commit/17bfba93ae1d427f51fe6e153f91134e233a5790))

## [2.4.10](https://github.com/rubiin/ultimate-nest/compare/v2.4.9...v2.4.10) (2024-06-15)


### Bug Fixes

* **deps:** update all non-major dependencies ([4f1fb10](https://github.com/rubiin/ultimate-nest/commit/4f1fb1050cef213ad5dcdea9f25b52320ba4c258))
* **deps:** update all non-major dependencies ([1b55f63](https://github.com/rubiin/ultimate-nest/commit/1b55f6302d82043f4080569d963e642aee8efb38))
* remove otp leak ([61ee20c](https://github.com/rubiin/ultimate-nest/commit/61ee20c3957a0a1070c3c868b15845afdbd5bfa3))
* **spell:** spell issues and file names ([838d731](https://github.com/rubiin/ultimate-nest/commit/838d73165c2148a0cef2b1f5952e3196e102fd63))

## [2.4.9](https://github.com/rubiin/ultimate-nest/compare/v2.4.8...v2.4.9) (2024-05-24)


### Bug Fixes

* **deps:** update all non-major dependencies ([4a4657e](https://github.com/rubiin/ultimate-nest/commit/4a4657e628c92631451438cb087658cb305baad9))

## [2.4.8](https://github.com/rubiin/ultimate-nest/compare/v2.4.7...v2.4.8) (2024-05-21)


### Bug Fixes

* **deps:** update dependency @mikro-orm/nestjs to v6 ([2d61d1a](https://github.com/rubiin/ultimate-nest/commit/2d61d1a8566432d2e47c0e55994375124fd19655))
* **deps:** update dependency poolifier to ^4.0.9 ([fa702ca](https://github.com/rubiin/ultimate-nest/commit/fa702ca8307d83bba0a0dab755804ec914a4c355))

## [2.4.7](https://github.com/rubiin/ultimate-nest/compare/v2.4.6...v2.4.7) (2024-05-15)


### Bug Fixes

* **deps:** update sentry-javascript monorepo to v8 ([3e88362](https://github.com/rubiin/ultimate-nest/commit/3e883624d084103ab7e9a2a72750ca3c0eb85cec))
* remove axios overide ([bff248d](https://github.com/rubiin/ultimate-nest/commit/bff248d8c3240bbef7df0ca9f6d4723f4d7aa71e))

## [2.4.6](https://github.com/rubiin/ultimate-nest/compare/v2.4.5...v2.4.6) (2024-05-11)


### Bug Fixes

* **deps:** update all non-major dependencies ([2dff84e](https://github.com/rubiin/ultimate-nest/commit/2dff84e37de38f76b40d3bec7f571cb9804cde8b))
* **deps:** update dependency pino-http to v10 ([de60001](https://github.com/rubiin/ultimate-nest/commit/de600014184c3b40e7d588bf209e5f3769f929d9))

## [2.4.5](https://github.com/rubiin/ultimate-nest/compare/v2.4.4...v2.4.5) (2024-05-06)


### Bug Fixes

* **deps:** update all non-major dependencies ([6a2fe0d](https://github.com/rubiin/ultimate-nest/commit/6a2fe0d88abdb7eab546623e6d352990418426f6))

## [2.4.4](https://github.com/rubiin/ultimate-nest/compare/v2.4.3...v2.4.4) (2024-05-03)


### Bug Fixes

* **deps:** update all non-major dependencies ([71f8b03](https://github.com/rubiin/ultimate-nest/commit/71f8b0328a004728baec1479750f4e15da3e918b))
* **deps:** update all non-major dependencies ([adae9ca](https://github.com/rubiin/ultimate-nest/commit/adae9cab1960cf4208d9b5ee177ff78c21e73df4))
* **deps:** update all non-major dependencies ([bab977f](https://github.com/rubiin/ultimate-nest/commit/bab977fc98ef2487144e57838d1e00a2dfbbc7b4))
* **traefik:** response latency ([f4786b6](https://github.com/rubiin/ultimate-nest/commit/f4786b6dea6f76188404e73d2e0eb65b86e47d37))

## [2.4.3](https://github.com/rubiin/ultimate-nest/compare/v2.4.2...v2.4.3) (2024-05-01)


### Bug Fixes

* **deps:** update all non-major dependencies to ^3.564.0 ([4c40367](https://github.com/rubiin/ultimate-nest/commit/4c403675d572b654a9f93764920fc6663c78336f))
* **deps:** update dependency isomorphic-dompurify to ^2.8.0 ([36fb0d2](https://github.com/rubiin/ultimate-nest/commit/36fb0d22a257299708bde1c6b0b626bef16d72f1))
* **deps:** update dependency poolifier to v4 ([53f91ff](https://github.com/rubiin/ultimate-nest/commit/53f91ffdec02a255952900d5d624d3dda62c5362))

## [2.4.2](https://github.com/rubiin/ultimate-nest/compare/v2.4.1...v2.4.2) (2024-04-24)


### Bug Fixes

* **deps:** update all non-major dependencies ([7a92023](https://github.com/rubiin/ultimate-nest/commit/7a920237450d1379d25ec7f8cee36e8d366111ca))
* **deps:** update all non-major dependencies to ^7.112.1 ([7d304fe](https://github.com/rubiin/ultimate-nest/commit/7d304fe5fd0c21bf27a4d8617e3d849135870793))
* **docker:** use lts node docker image ([a5ad90c](https://github.com/rubiin/ultimate-nest/commit/a5ad90cf62395cac468f8605de7064e0302a8b14))

## [2.4.1](https://github.com/rubiin/ultimate-nest/compare/v2.4.0...v2.4.1) (2024-04-21)


### Bug Fixes

* **deps:** update all non-major dependencies ([74aceac](https://github.com/rubiin/ultimate-nest/commit/74aceace0bf14a001d091bca2737c9a2d939e5e8))

## [2.4.0](https://github.com/rubiin/ultimate-nest/compare/v2.3.2...v2.4.0) (2024-04-17)


### Features

* **file:** Add ApiFileResponse decorator for file downloads ([8b55cd5](https://github.com/rubiin/ultimate-nest/commit/8b55cd5374dea263c52c5a023c2139f5e8c4a104))


### Bug Fixes

* **deps:** update all non-major dependencies ([96b2dba](https://github.com/rubiin/ultimate-nest/commit/96b2dbac33d9ed1f822bbe8985e2550cfaf0839a))
* **deps:** update all non-major dependencies ([d5586cd](https://github.com/rubiin/ultimate-nest/commit/d5586cdf9c2488ff1e55557abe6d8413d157f7be))
* **deps:** update dependency stripe to v15 ([5ffc78d](https://github.com/rubiin/ultimate-nest/commit/5ffc78d0520afe2f28bd647e80518630f51d7807))
* filetype detection on upload ([396287d](https://github.com/rubiin/ultimate-nest/commit/396287d19c23e0e7d0a18f8f04d6867961a51988))
* filetype detection on upload ([96b2dba](https://github.com/rubiin/ultimate-nest/commit/96b2dbac33d9ed1f822bbe8985e2550cfaf0839a))

## [2.3.2](https://github.com/rubiin/ultimate-nest/compare/v2.3.1...v2.3.2) (2024-04-07)


### Bug Fixes

* migration config fixes added ([57eb5b9](https://github.com/rubiin/ultimate-nest/commit/57eb5b9b816e8828d0db706d9554becb5e38e5be))

## [2.3.1](https://github.com/rubiin/ultimate-nest/compare/v2.3.0...v2.3.1) (2024-04-06)


### Bug Fixes

* add indexes for faster query ([eae7e27](https://github.com/rubiin/ultimate-nest/commit/eae7e272a73a9870417ab1a3f7a4dcc33106fccb))
* **deps:** update dependency date-fns-tz to v3 ([b86b84b](https://github.com/rubiin/ultimate-nest/commit/b86b84b42ec08c45d517e7fb3daa8b9a44b3f508))
* zonedTime ([2ef5cb6](https://github.com/rubiin/ultimate-nest/commit/2ef5cb6fb3c1890abb0e938d96d9d17265b346a1))

## [2.3.0](https://github.com/rubiin/ultimate-nest/compare/v2.2.4...v2.3.0) (2024-04-03)


### Features

* add isBooleanField decorator ([49bd9c1](https://github.com/rubiin/ultimate-nest/commit/49bd9c13485db404e88e20a561ddf7deeed1df2b))


### Bug Fixes

* **deps:** update all non-major dependencies ([918c42f](https://github.com/rubiin/ultimate-nest/commit/918c42fae0d2536c3201d52ceea3e751bfb2b72c))

## [2.2.4](https://github.com/rubiin/ultimate-nest/compare/v2.2.3...v2.2.4) (2024-03-29)


### Bug Fixes

* add custom file validation msg for filesize ([acb84f7](https://github.com/rubiin/ultimate-nest/commit/acb84f7e9a0e3a8be1c7ea246b1ecb3298a0f055))
* add web,svg as valid image format ([115958c](https://github.com/rubiin/ultimate-nest/commit/115958cddad70898b20f4fedd4937e3cd616e0b9))
* add web,svg as valid image format ([b9f5cd9](https://github.com/rubiin/ultimate-nest/commit/b9f5cd9481c63c49b0c90bf7f008f17602d58f92))
* custom message for  file format validation ([cb54625](https://github.com/rubiin/ultimate-nest/commit/cb546251be359f096083b2218f9329967d90f076))

## [2.2.3](https://github.com/rubiin/ultimate-nest/compare/v2.2.2...v2.2.3) (2024-03-25)


### Bug Fixes

* **deps:** update all non-major dependencies ([9606da0](https://github.com/rubiin/ultimate-nest/commit/9606da0014eb18ab136798768bd2cca10b9337d2))
* **deps:** update all non-major dependencies ([26b03db](https://github.com/rubiin/ultimate-nest/commit/26b03dbf4c0af5d4790f9faa4a64b503f8e19d03))
