// Налаштування шаблону
import templateConfig from '../template.config.js'
// Логгер
import logger from './logger.js'

import zipPack from "vite-plugin-zip-pack";
import path from 'path';

const isTmp = process.argv.includes('--tmp')
const isZip = process.argv.includes('--zip')

const inPath = isTmp ? './' : 'dist'
const outName = isTmp ? 'flsStart4' : path.basename(path.resolve())

export const zipPlugin = [
	...((isZip) ? [zipPack({
		enableLogging: false,
		inDir: inPath,
		outFileName: `${outName}.zip`,
		outDir: 'zip',
		filter: (fileName, filePath, isDirectory) => {
			const dirIgnorePath = !['backend', 'node_modules', 'dist', '.git', 'zip', '.vscode'].includes(filePath)
			const fileIgnorePath = !['TODO.txt', '.gitignore', 'package-lock.json', '_temp.js'].includes(fileName)
			return dirIgnorePath && fileIgnorePath
		},
		done: (err) => {
			err ? logger(`(!!) ${err}`) : logger(`Архів out/${outName}.zip створений!`)
		}
	})] : [])
]