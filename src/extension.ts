import * as vscode from "vscode";

export async function activate(context: vscode.ExtensionContext) {
  const gitExtension = vscode.extensions.getExtension("vscode.git");

  if (!gitExtension) {
    vscode.window.showErrorMessage("Git extension not found!");
    return;
  }

  await gitExtension.activate();

  const git = gitExtension.exports.getAPI(1);

  let disposable = vscode.commands.registerCommand(
    "extension.jackedDevInterceptCommit",
    async () => {
      const repo = git.repositories[0];

      if (!repo) {
        vscode.window.showErrorMessage("No repository found.");
        return;
      }

      const stagedChanges = repo.state.indexChanges.length > 0;

      if (!stagedChanges) {
        await vscode.commands.executeCommand("git.stageAll");
        vscode.window.showInformationMessage(
          "Staged all changes. Enter your commit message."
        );
      }

      const commitMessage = await vscode.window.showInputBox({
        placeHolder: "Enter commit message",
        prompt: "Please provide a commit message before proceeding.",
        validateInput: (text) =>
          text.trim() === "" ? "Commit message cannot be empty" : null,
      });

      if (!commitMessage) {
        vscode.window.showErrorMessage("Commit message was not provided.");
        return;
      }

      showPushupPrompt(commitMessage, repo);
    }
  );

  context.subscriptions.push(disposable);
}

async function showPushupPrompt(commitMessage: string, repo: any) {
  const result = await vscode.window.showQuickPick(["Confirm", "Cancel"], {
    placeHolder: "Time for 10 pushups bro. Just don't lie to yourself 😉",
  });

  if (result === "Confirm") {
    await repo.commit(commitMessage);
    vscode.window.showInformationMessage(
      "Well done, one step closer to being a chad dev."
    );
  } else {
    vscode.window.showInformationMessage(
      "Commit canceled ❌ I thought you could become a chad one day."
    );
  }
}

export function deactivate() {}
