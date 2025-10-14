#!/usr/bin/env tsx

import fs from 'fs'
import path from 'path'

const README_PATH = path.join(process.cwd(), 'README.md')
const DOCS_PATH = path.join(process.cwd(), 'docs', 'README.md')

function extractCategorizedSections(docsContent: string): string {
  const sections = [
    { name: 'Schema', newName: 'Schema Types' },
    { name: 'File Operations', newName: 'File Operations Methods' },
    { name: 'Report Processing', newName: 'Report Processing Methods' },
    { name: 'Validation', newName: 'Validation Methods' },
    { name: 'Tree Operations', newName: 'Tree Operations Methods' },
    { name: 'Test Operations', newName: 'Test Operations Methods' },
    { name: 'Enumerations', newName: 'Utility Types' },
    { name: 'Interfaces', newName: 'Utility Types' },
    { name: 'Type Aliases', newName: 'Utility Types' },
    { name: 'Variables', newName: 'Utility Types' },
  ]

  let apiContent = '## API Reference\n'
  let utilityTypesAdded = false

  for (const section of sections) {
    const sectionStart = docsContent.indexOf(`## ${section.name}`)
    if (sectionStart === -1) continue

    const nextSectionStart = docsContent.indexOf('## ', sectionStart + 1)
    const sectionEnd =
      nextSectionStart === -1 ? docsContent.length : nextSectionStart

    let sectionContent = docsContent.substring(sectionStart, sectionEnd).trim()

    sectionContent = sectionContent.replace(/\]\(([^)]+)\)/g, (match, url) => {
      if (url.startsWith('http') || url.startsWith('docs/')) {
        return match
      }
      return `](docs/${url})`
    })

    if (
      ['Enumerations', 'Interfaces', 'Type Aliases', 'Variables'].includes(
        section.name
      )
    ) {
      if (!utilityTypesAdded) {
        apiContent += '\n### Utility Types\n\n'
        utilityTypesAdded = true
      }
      const lines = sectionContent.split('\n')
      let listItems = lines.filter(line => line.startsWith('- ['))
      if (section.name === 'Enumerations' && listItems.length > 0) {
        listItems = listItems.map(item => item + ' (enumeration)')
      }
      if (listItems.length > 0) {
        apiContent += listItems.join('\n') + '\n'
      }
    } else {
      sectionContent = sectionContent.replace(
        `## ${section.name}`,
        `### ${section.newName}`
      )
      apiContent += '\n' + sectionContent + '\n'
    }
  }

  return apiContent.trim()
}

function updateReadmeWithDocs() {
  try {
    const originalReadme = fs.readFileSync(README_PATH, 'utf-8')

    const generatedDocs = fs.readFileSync(DOCS_PATH, 'utf-8')

    const apiReferenceContent = extractCategorizedSections(generatedDocs)

    const originalApiReferenceStart = originalReadme.indexOf('## API Reference')
    const nextSectionStart = originalReadme.indexOf(
      '## ',
      originalApiReferenceStart + 1
    )

    if (originalApiReferenceStart === -1) {
      console.error('Could not find "## API Reference" section in README.md')
      process.exit(1)
    }

    const beforeApiReference = originalReadme.substring(
      0,
      originalApiReferenceStart
    )

    const afterApiReference =
      nextSectionStart !== -1 ? originalReadme.substring(nextSectionStart) : ''

    const newReadme =
      beforeApiReference +
      apiReferenceContent +
      (afterApiReference ? '\n\n' + afterApiReference : '')

    fs.writeFileSync(README_PATH, newReadme)

    console.log('✅ README.md updated with categorized API documentation')
  } catch (error) {
    console.error('❌ Error updating README:', error)
    process.exit(1)
  }
}

updateReadmeWithDocs()
