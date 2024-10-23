import { ChangeCodeMirrorLanguage, codeMirrorPlugin, ConditionalContents, InsertCodeBlock, InsertSandpack, InsertTable, linkPlugin, ListsToggle, SandpackConfig, sandpackPlugin, ShowSandpackInfo, toolbarPlugin, UndoRedo, type CodeBlockEditorDescriptor } from '@mdxeditor/editor';
import { simpleSandpackConfig } from './type';
import { Icon } from '@iconify/react';
const { codeBlockPlugin, tablePlugin, headingsPlugin, listsPlugin, quotePlugin, markdownShortcutPlugin } = await import('@mdxeditor/editor')
import { hashTagPlugin } from '../MdxPlugin/hashTagPlugin';

export const MyPlugins = [
  codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
  sandpackPlugin({ sandpackConfig: simpleSandpackConfig }),
  codeMirrorPlugin({ codeBlockLanguages: { js: 'JavaScript', css: 'CSS' } }),
  listsPlugin(),
  linkPlugin(),
  quotePlugin(),
  tablePlugin(),
  markdownShortcutPlugin(),
  hashTagPlugin(),
]