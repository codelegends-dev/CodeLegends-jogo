/*:
 * @target MZ
 * @plugindesc Adds Import Save & Export Save buttons to the title menu (with auto-save before export).
 * @author Caethyril (modificado por ChatGPT)
 * @url https://forums.rpgmakerweb.com/index.php?threads/174088/
 * @help
 * Versão aprimorada do plugin original.
 * - Agora salva automaticamente o progresso antes de exportar.
 * - Permite exportar e importar saves em formato JSON.
 *
 * COMO USAR:
 * 1. Durante o jogo, pressione ESC > Salvar normalmente.
 * 2. Volte para a tela de título.
 * 3. Use "Exportar Save (Arquivo)" para copiar seu save para a área de transferência.
 * 4. Cole o conteúdo salvo em um arquivo .txt para guardar.
 * 5. Use "Importar Save" e cole o conteúdo para continuar de onde parou.
 */

(() => {
  "use strict";

  const COM_IN = "Importar Save";
  const COM_EX = "Exportar Save (Arquivo)";

  const addHeight = () => 2 * Window_TitleCommand.prototype.itemHeight();

  const postAction = function() {
    this._commandWindow.activate();
  };

  const importSuccess = function(id) {
    alert(`Save ${id} importado com sucesso!`);
  };

  const importFailure = function() {
    alert("Falha ao importar save.");
  };

  const exportSuccess = function() {
    alert("Save exportado com sucesso! Copiado para a área de transferência.");
  };

  const exportFailure = function() {
    alert("Falha ao exportar save.");
  };

  const importSave = function(
    id = DataManager.emptySavefileId(),
    json = prompt("Cole aqui os dados do save:")
  ) {
    if (id < 0 || !json) return postAction.call(this);

    const key = DataManager.makeSavename(id);
    StorageManager.jsonToZip(json)
      .then(zip => StorageManager.saveZip(key, zip))
      .then(() => DataManager.loadGame(id))
      .then(() => DataManager.saveGame(id))
      .then(importSuccess.bind(this, id))
      .catch(importFailure.bind(this))
      .finally(postAction.bind(this));
  };

  const exportSave = function(id = prompt("Digite o número do slot para exportar (ex: 1):")) {
    id = parseInt(id);
    if (!DataManager.savefileExists(id)) {
      alert(`Slot ${id} não encontrado.`);
      return postAction.call(this);
    }

    DataManager.loadGame(id)
      .then(() => DataManager.saveGame(id)) // Auto-salva antes de exportar
      .then(() => {
        const key = DataManager.makeSavename(id);
        return StorageManager.loadZip(key);
      })
      .then(zip => StorageManager.zipToJson(zip))
      .then(json => navigator.clipboard.writeText(json))
      .then(exportSuccess.bind(this))
      .catch(exportFailure.bind(this))
      .finally(postAction.bind(this));
  };

  const alias_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
  Window_TitleCommand.prototype.makeCommandList = function() {
    alias_makeCommandList.call(this);
    this.addCommand(COM_IN, "saveImport");
    this.addCommand(COM_EX, "saveExport", DataManager.isAnySavefileExists());
  };

  const alias_createCommandWindow = Scene_Title.prototype.createCommandWindow;
  Scene_Title.prototype.createCommandWindow = function() {
    alias_createCommandWindow.call(this);
    const w = this._commandWindow;
    w.setHandler("saveImport", importSave.bind(this));
    w.setHandler("saveExport", exportSave.bind(this));
  };

  const alias_commandWindowRect = Scene_Title.prototype.commandWindowRect;
  Scene_Title.prototype.commandWindowRect = function() {
    const rect = alias_commandWindowRect.call(this);
    rect.height += addHeight();
    return rect;
  };
})();
