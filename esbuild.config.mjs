import fs from 'fs-extra'
import path from 'path'
import open from 'open'
import esbuild from 'esbuild'
import process from 'process'
import builtins from 'builtin-modules'

const banner = `/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
`

// build
// -----------------------------------------------------------------------------

const prod = process.argv[2] === 'production'

await esbuild
    .build({
        banner: {
            js: banner,
        },
        entryPoints: ['main.ts'],
        bundle: true,
        external: [
            'obsidian',
            'electron',
            '@codemirror/autocomplete',
            '@codemirror/closebrackets',
            '@codemirror/collab',
            '@codemirror/commands',
            '@codemirror/comment',
            '@codemirror/fold',
            '@codemirror/gutter',
            '@codemirror/highlight',
            '@codemirror/history',
            '@codemirror/language',
            '@codemirror/lint',
            '@codemirror/matchbrackets',
            '@codemirror/panel',
            '@codemirror/rangeset',
            '@codemirror/rectangular-selection',
            '@codemirror/search',
            '@codemirror/state',
            '@codemirror/stream-parser',
            '@codemirror/text',
            '@codemirror/tooltip',
            '@codemirror/view',
            '@lezer/common',
            '@lezer/highlight',
            '@lezer/lr',
            ...builtins,
        ],
        format: 'cjs',
        watch: !prod,
        target: 'es2016',
        logLevel: 'info',
        sourcemap: prod ? false : 'inline',
        treeShaking: true,
        outfile: 'main.js',
    })
    .catch(() => process.exit(1))

// copy builded files in to vault
// -----------------------------------------------------------------------------

const OBSIDIAN_VAULT = process.env.OBSIDIAN_VAULT

if (OBSIDIAN_VAULT) {
    const innerDirPath = path.join(OBSIDIAN_VAULT, '.obsidian')
    const pluginDirPath = path.join(innerDirPath, 'plugins', 'obsidian-biossun')

    if (!(await fs.pathExists(innerDirPath))) {
        console.error(`
			env: OBSIDIAN_VAULT (${OBSIDIAN_VAULT})
			is not a valid obsidian vault path.
		`)
    }

    await fs.ensureDir(pluginDirPath)

    copyFiles('.', pluginDirPath, ['main.js', 'styles.css', 'manifest.json'])

    console.log(`
		plugin files is copied to your vault
	`)
} else {
    console.log(`
		If you want auto copy plugin files to your vault,
		you need to define a environment variable: OBSIDIAN_VAULT
	`)
}

function copyFiles(srcDir, destDir, files) {
    return Promise.all(
        files.map((f) => {
            return fs.copyFile(path.join(srcDir, f), path.join(destDir, f))
        }),
    )
}

// reload obsidian, with out save
// need [Command URI Plugin](https://github.com/deathau/command-uri-obsidian)
// -----------------------------------------------------------------------------

await open('obsidian://command?app:reload')