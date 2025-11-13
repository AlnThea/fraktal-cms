# 🧩 Plugin System

Fraktal CMS features a **powerful, dynamic plugin system** that allows third-party plugins to extend the page editor functionality without modifying core code.

## 📖 Table of Contents

- [Quick Start](#-quick-start)
- [Plugin Structure](#-plugin-structure)
- [API Reference](#-api-reference)
- [Examples](#-examples)
- [Development Guide](#-development-guide)
- [Best Practices](#-best-practices)

## 🚀 Quick Start

### Basic Plugin Example

```javascript
// my-plugin.umd.js
window.MyPluginBlocks = function(editor, options) {
  editor.BlockManager.add('custom-button', {
    label: 'Custom Button',
    category: 'Basic',
    content: {
      type: 'button',
      classes: ['btn', 'btn-primary'],
      content: 'Click Me'
    }
  });
};
```

### Plugin Registration
Plugins are registered via the backend API:
```json
{
    "name": "Blocks Name",
        "slug": "block_name",
        "type": "grapejs-block",
        "version": "1.0.0",
        "description": "blocks for GrapeJS editor",
        "author": "your name",
        "author_url": "https://example.com",
        "plugin_url": "https://example.com/plugins/blocks-name",
        "main_file": "blocks-name.umd.js",
        "assets": {
        "js": [
            "blocks-name.umd.js"
        ]
    },
    "dependencies": {
        "grapejs": ">=0.20.0"
    },
    "settings": {
        "premium": false,
        "category": "basic"
    }
}
```
above for free block, but for premium like using license key you can change the setting like this:
```json
{  
    "settings": {
        "premium": true,
        "category": "advanced"
    }
}
```

## 📦 Plugin Structure
### Core Plugin Function
Every plugin must export a function that receives the editor instance:

```javascript
function MyPlugin(editor, options) {
    // Your plugin logic here
    // Add blocks, components, commands, etc.
}
```

## 🎯 Supported Export Formats
The system automatically detects these patterns:

```javascript
// Name + Blocks (Recommended)
window.MyPluginBlocks = function(editor, options) { }

// Name + Plugin
window.MyPluginPlugin = function(editor, options) { }

// t + PascalCase  
window.tMyPlugin = function(editor, options) { }

// Name only
window.MyPlugin = function(editor, options) { }

// Any global function (auto-detected)
window.CustomExportName = function(editor, options) { }
```

## 🔧 API Reference

### Block Management
```javascript
editor.BlockManager.add('block-id', {
    label: 'Block Label',
    category: 'Category Name',
    content: {
        type: 'component-type',
        // Component properties
    },
    media: '<svg>...</svg>',
    attributes: {
        title: 'Block description'
    }
});
```
### Component Types
```javascript
editor.DomComponents.addType('custom-component', {
    model: {
        defaults: {
            tagName: 'div',
            draggable: true,
            droppable: true,
            attributes: {
                class: 'custom-component'
            },
            traits: [
                {
                    type: 'text',
                    name: 'title',
                    label: 'Title',
                    changeProp: true
                }
            ]
        }
    }
});
```
### Custom Commands
```javascript
editor.Commands.add('custom-command', {
    run(editor, sender, options) {
        // Command logic
        editor.Modal.setTitle('Custom Command')
            .setContent('Hello from plugin!')
            .open();
    }
});
```

### Panel Buttons
```javascript
editor.Panels.addButton('options', {
    id: 'custom-action',
    className: 'fa fa-star',
    command: 'custom-command',
    attributes: {
        title: 'Custom Action'
    }
});
```
## 🛠 Advanced Examples
### Custom Card Block with Traits
```javascript
window.CardPlugin = function(editor) {
  // Add card block
  editor.BlockManager.add('advanced-card', {
    label: 'Card',
    category: 'Layout',
    content: {
      type: 'advanced-card',
      traits: [
        { type: 'text', name: 'title', label: 'Title' },
        { type: 'select', name: 'variant', label: 'Variant' }
      ]
    }
  });

  // Define card component
  editor.DomComponents.addType('advanced-card', {
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 
          class: 'card'
        },
        traits: [
          {
            type: 'text',
            name: 'title',
            label: 'Card Title'
          },
          {
            type: 'select',
            name: 'variant',
            label: 'Variant',
            options: [
              { value: 'primary', name: 'Primary' },
              { value: 'secondary', name: 'Secondary' }
            ]
          }
        ]
      }
    }
  });
};
```
### Interactive Plugin with Commands
```javascript
window.InteractivePlugin = function(editor) {
    // Add toolbar button
    editor.Panels.addButton('options', {
        id: 'export-data',
        className: 'fa fa-download',
        command: 'export-plugin-data',
        attributes: {
            title: 'Export Plugin Data'
        }
    });

    // Custom export command
    editor.Commands.add('export-plugin-data', {
        run(editor, sender, options) {
            const componentData = editor.getComponents();

            const exportData = {
                components: componentData,
                timestamp: new Date().toISOString()
            };

            editor.Modal.setTitle('Plugin Data Export')
                .setContent('<pre>' + JSON.stringify(exportData, null, 2) + '</pre>')
                .open();
        }
    });
};
```

### Panel Buttons
```javascript
editor.Panels.addButton('options', {
    id: 'custom-action',
    className: 'fa fa-star',
    command: 'custom-command',
    attributes: {
        title: 'Custom Action'
    }
});
```

## 🏗 Development Guide
### Local Development Setup
1. Create your plugin file structure:
```text
(recommended)
my-fraktal-plugin/ 
└── my-plugin.umd.js
└── package.json
```
or
```text
my-fraktal-plugin/
├── src/
│   └── index.js
├── dist/
│   └── my-plugin.umd.js
└── package.json
```

2. UMD Build Template:
```javascript
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.MyPluginBlocks = factory();
    }
}(typeof self !== 'undefined' ? self : this, function() {
    return function(editor, options) {
        // Your plugin implementation
        editor.BlockManager.add('my-block', {
            label: 'My Block',
            category: 'Custom',
            content: '<div>Hello from plugin!</div>'
        });
    };
}));
```

### Testing Your Plugin
```javascript
// Temporarily test in browser console
window.TestPlugin = function(editor) {
  console.log('Plugin test successful!', editor);
  // Test your plugin logic
};
```
## ✅ Best Practices
### Code Organization
```javascript
window.WellStructuredPlugin = function(editor, options) {
    // Initialize modules
    initBlocks(editor);
    initComponents(editor);
    initCommands(editor);
};

function initBlocks(editor) {
    // All block-related code
}

function initComponents(editor) {
    // All component-related code
}
```
### Error Handling
```javascript
window.RobustPlugin = function(editor, options) {
    try {
        if (!editor || !editor.BlockManager) {
            throw new Error('Editor API not available');
        }

        editor.BlockManager.add('safe-block', {
            // Block configuration
        });

    } catch (error) {
        console.error('Plugin initialization failed:', error);
    }
};
```
## 🐛 Debugging
### Debug Mode
```text
🔄 Loading plugin: My Plugin
✅ Script loaded successfully  
🔍 Trying generated names: [...]
✅ Plugin initialized successfully
```
### Debug Helper
```javascript
window.DebugPlugin = function(editor, options) {
    console.group('🔄 Plugin Initialization');
    console.log('Editor API available:', Object.keys(editor));
    console.log('Options:', options);
    console.groupEnd();
};
```

## ❓ FAQ
```text
Q: Can I use npm packages in my plugins?
A: Yes! Bundle your dependencies with webpack or similar tools.

Q: How do I add CSS styles to my plugin?
A: Include CSS in your plugin assets or inject styles dynamically.

Q: Can plugins communicate with each other?
A: Yes, through the editor event system.

Q: How do I update my plugin?
A: Update the plugin file on your server and the system will load the new version automatically.

```

## 🎯 Production Checklist

Before deploying your plugin:
```text
- Test with latest Fraktal CMS version
- Minify and optimize your bundle
- Add comprehensive error handling
- Include documentation
- Test in multiple browsers
- Verify mobile responsiveness
```

## 🤝 Contributing Plugins
We welcome community plugins! To contribute:
```text
- Follow the plugin structure and best practices
- Test with the latest Fraktal CMS version
- Include comprehensive documentation
- Submit via Pull Request or publish independently
```
📬 Support

For plugin development questions:
```text
-  Open an issue on GitHub
- Check existing plugin examples
- Join developer discussions
```
Happy Plugin Building! 🚀

The Terra Core X Team
