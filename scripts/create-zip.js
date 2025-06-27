const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Get version from manifest.json
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'manifest.json'), 'utf8'));
const version = manifest.version;

// Create a file to stream archive data to
const outputPath = path.join(distDir, `stretchly-extension-v${version}.zip`);
const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', {
  zlib: { level: 9 } // Maximum compression
});

// Listen for all archive data to be written
output.on('close', function() {
  console.log(`✅ Extension packaged successfully!`);
  console.log(`📦 Output: ${outputPath}`);
  console.log(`📊 Size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
});

// Handle warnings
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn('Warning:', err);
  } else {
    throw err;
  }
});

// Handle errors
archive.on('error', function(err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Add files to the archive
const filesToInclude = [
  'manifest.json',
  'background.js',
  'popup.html',
  'onboarding.html',
  'settings.html',
  'notification.html',
  'images/**/*',
  'scripts/**/*.js',
  'styles/**/*.css',
  'stretches/**/*',
  'videos/**/*'
];

// Files to exclude
const filesToExclude = [
  'node_modules',
  '.git',
  '.DS_Store',
  '*.zip',
  'dist',
  'scripts/create-zip.js',
  'scripts/build.js',
  'package.json',
  'package-lock.json',
  '.gitignore',
  'README.md'
];

console.log('📦 Creating extension package...');

// Add files
filesToInclude.forEach(pattern => {
  if (pattern.includes('**')) {
    // It's a glob pattern
    const baseDir = pattern.split('/')[0];
    archive.directory(path.join(__dirname, '..', baseDir), baseDir, {
      globOptions: {
        ignore: filesToExclude
      }
    });
  } else {
    // It's a single file
    const filePath = path.join(__dirname, '..', pattern);
    if (fs.existsSync(filePath)) {
      archive.file(filePath, { name: pattern });
    }
  }
});

// Finalize the archive
archive.finalize();