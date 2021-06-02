import * as _monaco from 'monaco-editor';
const MonacoCollabExt = require('@convergencelabs/monaco-collab-ext');
import '@convergencelabs/monaco-collab-ext/css/monaco-collab-ext.min.css';

class _Monaco {

    monaco = _monaco;
    editor?: _monaco.editor.IStandaloneCodeEditor;
    model?: _monaco.editor.ITextModel;
    remoteCursorManager: any = null;
    remoteSelectionManager: any = null;

    cursors: any = {};
    selections: any = {};

    collabContentManager = MonacoCollabExt.EditorContentManager;

    constructor() {
        this.monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: false
        });

        this.monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            jsx: this.monaco.languages.typescript.JsxEmit.React,
            allowNonTsExtensions: true,
            moduleResolution: this.monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            module: this.monaco.languages.typescript.ModuleKind.CommonJS,
            noEmit: true,
            esModuleInterop: true,
            typeRoots: ["node_modules/@types"],
            baseUrl: './',
        });

        ['react', 'react-dom', 'styled-components'].forEach(this.loaStaticdDTS);
    }

    loaStaticdDTS = (libName: string) => {
        const xhr = new XMLHttpRequest();
        xhr.open('get', `/${libName}.d.ts`, false);
        xhr.send();
        this.monaco.languages.typescript.typescriptDefaults.addExtraLib(xhr.response, `file:///node_modules/@types/${libName}/index.d.ts`);
    }

    createEditor = (ref: HTMLDivElement): _monaco.editor.IStandaloneCodeEditor | null => {
        if (ref) {
            this.createModel();
            this.editor = this.monaco.editor.create(ref, {
                theme: "vs-dark",
                automaticLayout: true,
                model: this.model
            }) as _monaco.editor.IStandaloneCodeEditor;

            this.remoteCursorManager = new MonacoCollabExt.RemoteCursorManager({
                editor: this.editor,
                tooltips: true,
                tooltipDuration: 2
            });

            this.remoteSelectionManager = new MonacoCollabExt.RemoteSelectionManager({ editor: this.editor });

            return this.editor;
        }
        return null;
    }

    createModel = () => {

        this.model = this.model ?? this.monaco.editor.createModel(``, 'typescript', this.monaco.Uri.parse(`file:///index.tsx`));

        this.monaco.editor.setModelLanguage(this.model, 'typescript');
    }

    updateModel = (data: string) => {
        this.model?.setValue(data ?? '');
    }

    appendCursor(cursorId: string, color: string, name?: string) {
        this.cursors[cursorId] = this.remoteCursorManager.addCursor(cursorId, `#${color}`, name ?? cursorId);
    }

    appendSelection(selectionId: string, color: string) {
        this.selections[selectionId] = this.remoteSelectionManager.addSelection(selectionId, `#${color}`);
    }

    removeCursor(cursorId: string) {
        this.cursors[cursorId].dispose();
        delete this.cursors[cursorId];
    }

    removeSelection(selectionId: string) {
        this.selections[selectionId].dispose();
        delete this.selections[selectionId];
    }


}

export const Monaco = new _Monaco();