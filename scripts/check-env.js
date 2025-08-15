#!/usr/bin/env node

/**
 * Environment Variables Security Check
 * Verifies that no hardcoded secrets are present in the codebase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Known secrets that should not appear in code (add real secrets here for detection)
const KNOWN_SECRETS = [
    '251900786787-rs2a373jkaetk9lmh49nch3tq5p3lnhp.apps.googleusercontent.com',
    '1e60c638e6c99899e27a3bec16b056dfd8fc1e5cace56a9c09e3a324f0de8f39'
];

// Files to check
const FILES_TO_CHECK = [
    'src/js/config.js',
    'src/js/auth.js', 
    'src/js/llm.js',
    'index.html'
];

function checkForHardcodedSecrets() {
    console.log('🔍 Checking for hardcoded secrets...\n');
    
    let foundSecrets = false;
    
    FILES_TO_CHECK.forEach(filePath => {
        const fullPath = path.join(projectRoot, filePath);
        
        if (!fs.existsSync(fullPath)) {
            console.log(`⚠️  File not found: ${filePath}`);
            return;
        }
        
        const content = fs.readFileSync(fullPath, 'utf8');
        
        KNOWN_SECRETS.forEach(secret => {
            if (content.includes(secret)) {
                console.log(`❌ SECURITY RISK: Found hardcoded secret in ${filePath}`);
                console.log(`   Secret: ${secret.substring(0, 10)}...`);
                foundSecrets = true;
            }
        });
    });
    
    if (!foundSecrets) {
        console.log('✅ No hardcoded secrets found!');
    }
    
    return !foundSecrets;
}

function checkEnvFile() {
    console.log('\n🔧 Checking environment configuration...\n');
    
    const envPath = path.join(projectRoot, '.env');
    const envExamplePath = path.join(projectRoot, '.env.example');
    
    if (!fs.existsSync(envPath)) {
        console.log('❌ .env file not found - create one from .env.example');
        return false;
    }
    
    if (!fs.existsSync(envExamplePath)) {
        console.log('❌ .env.example file not found');
        return false;
    }
    
    console.log('✅ Environment files present');
    return true;
}

function main() {
    console.log('🛡️  Smart Scheduler Security Check\n');
    
    const secretsOk = checkForHardcodedSecrets();
    const envOk = checkEnvFile();
    
    if (secretsOk && envOk) {
        console.log('\n✅ All security checks passed!');
        process.exit(0);
    } else {
        console.log('\n❌ Security issues found - please fix before deployment');
        process.exit(1);
    }
}

main();