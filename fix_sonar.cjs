const fs = require('fs');
const path = require('path');

const fixComponent = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add PropTypes import
    if (!content.includes("import PropTypes from 'prop-types'")) {
        content = "import PropTypes from 'prop-types';\n" + content;
    }

    // Extract props
    const match = content.match(/const\s+([A-Z][a-zA-Z0-9_]*)\s*=\s*\(\{\s*([\s\S]+?)\s*\}\)/);
    if (match) {
        const componentName = match[1];
        const propsStr = match[2];
        const props = propsStr.split(',').map(p => p.trim().split('=')[0].trim()).filter(p => p && !p.startsWith('//') && !p.startsWith('/*'));
        
        let propTypesObj = `${componentName}.propTypes = {\n`;
        props.forEach(p => {
            // Check for rest params or weird characters
            const cleanProp = p.split(':')[0].split(' ')[0];
            if (/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(cleanProp)) {
                propTypesObj += `  ${cleanProp}: PropTypes.any,\n`;
            }
        });
        propTypesObj += `};\n`;

        if (!content.includes(`${componentName}.propTypes`)) {
            content = content.replace(new RegExp(`export default ${componentName};`), `${propTypesObj}\nexport default ${componentName};`);
        }
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
};

const dirs = ['src/components', 'src/pages'];
dirs.forEach(d => {
    const p = path.join(__dirname, d);
    if(fs.existsSync(p)) {
        fs.readdirSync(p).forEach(f => {
            if (f.endsWith('.jsx') && !f.endsWith('.test.jsx')) {
                fixComponent(path.join(p, f));
            }
        });
    }
});

// App.jsx separately since it doesn't have props but might need fix
fixComponent(path.join(__dirname, 'src', 'App.jsx'));
