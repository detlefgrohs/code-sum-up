// The module 'vscode' contains the VS Code extensibility API
// Import the necessary extensibility types to use in your code below
import { window, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem } from 'vscode';

// This method is called when your extension is activated. Activation is
// controlled by the activation events defined in package.json.
export function activate(context: ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error).
    // This line of code will only be executed once when your extension is activated.
    console.log('Code sum up is now active!');

    // create a new word counter
    let wordCounter = new WordCounter();
    let controller = new WordCounterController(wordCounter);

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(controller);
    context.subscriptions.push(wordCounter);
}

// from https://stackoverflow.com/a/42264780/1013
const NUMERIC_REGEXP = /[-]{0,1}[\d]*[\.]{0,1}[\d]+/g;
class WordCounter {

    private _statusBarItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);

    public updateWordCount() {

        // Get the current text editor
        let editor = window.activeTextEditor;
        if (!editor) {
            this._statusBarItem.hide();
            return;
        }

        let selection = editor.selection;
        let text = editor.document.getText(selection);

        let wordCount = this._getWordCount(text);

        // Update the status bar
        this._statusBarItem.text = `Sum: ${wordCount}`;
        this._statusBarItem.show();
    }

    public _getWordCount(doc: string): number {
        let lines = doc.trim().split('\n');

        // extracts all the numbers in the selected lines
        // and converts them to floats
        // and if there is a number, get only the first one found
        let numLines = lines.map((line) => {
            const nums = line.match(NUMERIC_REGEXP);
            // the +(thingy) is doing the conversion of string to float
            if (nums && nums.length > 0) { return +(nums[0]); }
            else { return 0; }
        });

        // add up lines
        let total = numLines.reduce((tot, curr) => tot + curr, 0);

        return total;
    }

    dispose() {
        this._statusBarItem.dispose();
    }
}

class WordCounterController {

    private _wordCounter: WordCounter;
    private _disposable: Disposable;

    constructor(wordCounter: WordCounter) {
        this._wordCounter = wordCounter;

        // subscribe to selection change and editor activation events
        let subscriptions: Disposable[] = [];
        window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
        window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);

        // update the counter for the current file
        this._wordCounter.updateWordCount();

        // create a combined disposable from both event subscriptions
        this._disposable = Disposable.from(...subscriptions);
    }

    dispose() {
        this._disposable.dispose();
    }

    private _onEvent() {
        this._wordCounter.updateWordCount();
    }
}