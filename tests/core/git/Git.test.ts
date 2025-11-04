import { Logger } from '@flxbl-io/sfp-logger';
import fs from 'fs-extra';
import path from 'path';
import Git from '../../../src/core/git/Git';
import simplegit from 'simple-git';

describe('Git Integration Tests', () => {
    let originalCwd: string;
    let testRepoDir: string;
    let logger: Logger;
    
    beforeEach(async () => {
        originalCwd = process.cwd();
        testRepoDir = fs.mkdtempSync(path.join(__dirname, 'test-repo-'));
        process.chdir(testRepoDir);
        await createTestRepository();
    });

    afterEach(async () => {
        process.chdir(originalCwd);
        const remoteDir = await simplegit(testRepoDir).getConfig('remote.origin.url');
        await fs.remove(testRepoDir);
        if (remoteDir.value) {
            await fs.remove(remoteDir.value);
        }
    });

    async function createTestRepository() {
        // Initialize a local git repository
        const git = simplegit(testRepoDir);
        await git.init();
        
        await git.addConfig('user.name', 'Test User');
        await git.addConfig('user.email', 'test@example.com');
        // Create local repository to be used as remote
        const remoteDir = fs.mkdtempSync(path.join(__dirname, 'remote-'));
        await simplegit(remoteDir).init();
        
        // Add remote pointing to local bare repo
        await git.addRemote('origin', remoteDir);

        // Create .gitignore first
        const gitignoreContent = `node_modules/
dist/
build/
*.log
coverage/
.vscode/
.idea/
*.min.js
.DS_Store
.nyc_output/
package-lock.json
*.test.ts`;

        await fs.writeFile(path.join(testRepoDir, '.gitignore'), gitignoreContent);
        await git.add('.gitignore');
        await git.commit('Add gitignore');

        // Create test files that should be included
        const filesToInclude = {
            'package.json': '{"name": "test-repo"}',
            'src/index.ts': 'console.log("Hello World");',
            'src/utils/helper.ts': 'export const add = (a: number, b: number) => a + b;',
            'README.md': '# Test Repository'
        };

        // Create and commit included files
        for (const [filePath, content] of Object.entries(filesToInclude)) {
            await fs.ensureDir(path.dirname(path.join(testRepoDir, filePath)));
            await fs.writeFile(path.join(testRepoDir, filePath), content);
        }

        await git.add('.');
        await git.commit('Add included files');

        // Create files that should be excluded
        const filesToExclude = {
            'node_modules/test.txt': 'test file',
            'node_modules/test3.txt': 'another test file',
            'node_modules/lodash/package.json': '{"name": "lodash"}',
            'dist/bundle.js': 'console.log("bundled");',
            'build/output.js': 'console.log("built");',
            'debug.log': 'some debug info',
            'coverage/lcov.info': 'coverage data',
            '.vscode/settings.json': '{"editor.formatOnSave": true}',
            '.idea/workspace.xml': '<project></project>',
            'a.test.ts': 'test file',
        };

        // Create excluded files
        for (const [filePath, content] of Object.entries(filesToExclude)) {
            await fs.ensureDir(path.dirname(path.join(testRepoDir, filePath)));
            await fs.writeFile(path.join(testRepoDir, filePath), content);
        }
    }

    it('should correctly copy repository respecting .gitignore', async () => {
        // Create temporary repository
        const git = await Git.initiateRepoAtTempLocation(logger);
        const tempRepoPath = git.getRepositoryPath();

        try {
            // Files that should exist
            const shouldExist = [
                'package.json',
                'src/index.ts',
                'src/utils/helper.ts',
                'README.md',
                '.gitignore',
                '.git'
            ];

            // Files that should NOT exist
            const shouldNotExist = [
                'node_modules/test.txt',
                'node_modules/test3.txt',
                'node_modules/lodash/package.json',
                'dist/bundle.js',
                'build/output.js',
                'debug.log',
                'coverage/lcov.info',
                '.vscode/settings.json',
                '.idea/workspace.xml',
                
            ];

            // Verify files that should exist
            for (const file of shouldExist) {
                const exists = fs.existsSync(path.join(tempRepoPath, file));
                expect(exists).toBe(true);
            }

            // Verify files that should NOT exist
            for (const file of shouldNotExist) {
                const exists = fs.existsSync(path.join(tempRepoPath, file));
                expect(exists).toBe(false);
            }
        } finally {
            await git.deleteTempoRepoIfAny();
        }
    });

    it('should respect .gitignore for 2 ignored directory', async () => {
      const git = await Git.initiateRepoAtTempLocation(logger);
      const tempRepoPath = git.getRepositoryPath();

      try {
          // Log the contents of temp directory
          console.log('Files in temp repo:', await fs.readdir(tempRepoPath, { recursive: true }));

          // Check specific file
          const ignoredFile1= path.join(tempRepoPath, 'node_modules/test.txt');
          const exists1 = fs.existsSync(ignoredFile1);

          const ignoredFile2 = path.join(tempRepoPath, 'node_module/test3.txt');
          const exists2 = fs.existsSync(ignoredFile2);
          console.log('Ignored file exists?', exists1);
          console.log('Ignored file path:', ignoredFile1);

          expect(exists1).toBe(false);
          expect(exists2).toBe(false);
      } finally {
          await git.deleteTempoRepoIfAny();
      }
  });

  it('should handle files in .gitignore correctly', async () => {
    // Create files with different extensions
    await fs.writeFile(path.join(testRepoDir, 'test.log'), 'log file');
    await fs.writeFile(path.join(testRepoDir, 'test.min.js'), 'minified js');
    await fs.writeFile(path.join(testRepoDir, 'test.js'), 'regular js');

    const git = await Git.initiateRepoAtTempLocation(logger);
    const tempRepoPath = git.getRepositoryPath();

    try {
        expect(fs.existsSync(path.join(tempRepoPath, 'test.log'))).toBe(false);
        expect(fs.existsSync(path.join(tempRepoPath, 'test.min.js'))).toBe(false);
        expect(fs.existsSync(path.join(tempRepoPath, 'test.js'))).toBe(true);
    } finally {
        await git.deleteTempoRepoIfAny();
    }
});

it('should copy empty directories if not ignored', async () => {
    await fs.ensureDir(path.join(testRepoDir, 'empty-dir'));
    await fs.ensureDir(path.join(testRepoDir, 'node_modules/empty-subdir'));

    const git = await Git.initiateRepoAtTempLocation(logger);
    const tempRepoPath = git.getRepositoryPath();

    try {
        expect(fs.existsSync(path.join(tempRepoPath, 'empty-dir'))).toBe(true);
        expect(fs.existsSync(path.join(tempRepoPath, 'node_modules/empty-subdir'))).toBe(false);
    } finally {
        await git.deleteTempoRepoIfAny();
    }
});

it('should handle non specific test files', async () => {
    await fs.ensureDir(path.join(testRepoDir, 'src'));
    // Create test files
    await fs.writeFile(path.join(testRepoDir, 'src/valid.ts'), 'valid file');
    await fs.writeFile(path.join(testRepoDir, 'src/component.test.ts'), 'test file');

    const git = await Git.initiateRepoAtTempLocation(logger);
    const tempRepoPath = git.getRepositoryPath();

    try {
        expect(fs.existsSync(path.join(tempRepoPath, 'src/valid.ts'))).toBe(true);
        expect(fs.existsSync(path.join(tempRepoPath, 'src/component.test.ts'))).toBe(false);
    } finally {
        await git.deleteTempoRepoIfAny();
    }
});

it('should handle symlinks correctly', async () => {
    // Create a symlink if not in Windows
    if (process.platform !== 'win32') {
        await fs.writeFile(path.join(testRepoDir, 'target.txt'), 'target file');
        await fs.symlink(
            path.join(testRepoDir, 'target.txt'),
            path.join(testRepoDir, 'link.txt')
        );

        const git = await Git.initiateRepoAtTempLocation(logger);
        const tempRepoPath = git.getRepositoryPath();

        try {
            const isSymlink = (await fs.lstat(path.join(tempRepoPath, 'link.txt'))).isSymbolicLink();
            expect(isSymlink).toBe(true);
            expect(fs.existsSync(path.join(tempRepoPath, 'target.txt'))).toBe(true);
        } finally {
            await git.deleteTempoRepoIfAny();
        }
    }
});
});