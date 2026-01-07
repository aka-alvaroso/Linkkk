/**
 * Script to replace console.log statements with Winston logger
 * Intelligently adds context based on the log message
 */

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: node replaceConsoleLogs.js <filepath>');
  process.exit(1);
}

const fullPath = path.resolve(filePath);
let content = fs.readFileSync(fullPath, 'utf8');

// Remove emojis from messages
const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E0}-\u{1F1FF}]/gu;

// Replace console.error patterns
content = content.replace(
  /console\.error\((["'])([^\1]+?)\1,?\s*(.*?)\);?/gs,
  (match, quote, message, context) => {
    const cleanMessage = message.replace(emojiRegex, '').trim();
    if (context.trim()) {
      return `logger.error("${cleanMessage}", { error: ${context.trim()} });`;
    }
    return `logger.error("${cleanMessage}");`;
  }
);

// Replace console.log patterns with context
content = content.replace(
  /console\.log\(\`([^`]+)\`\);?/g,
  (match, message) => {
    const cleanMessage = message.replace(emojiRegex, '').trim();

    // Extract variables from template literals
    const variables = message.match(/\$\{([^}]+)\}/g);
    if (variables && variables.length > 0) {
      const contextPairs = variables.map(v => {
        const varName = v.replace(/\$\{|\}/g, '');
        const key = varName.split('.').pop().replace(/Id$/, '');
        return `${key}: ${varName}`;
      });
      return `logger.info("${cleanMessage.replace(/\$\{[^}]+\}/g, () => {
        const v = variables.shift();
        return v ? v.replace(/\$\{|\}/g, '') : '';
      })}", { ${contextPairs.join(', ')} });`;
    }

    return `logger.info("${cleanMessage}");`;
  }
);

// Replace simple console.log with strings
content = content.replace(
  /console\.log\((["'])([^\1]+?)\1\);?/g,
  (match, quote, message) => {
    const cleanMessage = message.replace(emojiRegex, '').trim();
    return `logger.info("${cleanMessage}");`;
  }
);

// Replace console.warn
content = content.replace(
  /console\.warn\((["'])([^\1]+?)\1\);?/g,
  (match, quote, message) => {
    const cleanMessage = message.replace(emojiRegex, '').trim();
    return `logger.warn("${cleanMessage}");`;
  }
);

fs.writeFileSync(fullPath, content, 'utf8');
console.log(`✅ Replaced console statements in: ${fullPath}`);
console.log(`📝 Please review the changes and adjust context as needed`);
