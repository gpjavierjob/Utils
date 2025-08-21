const mimeTypes = [MimeType.MICROSOFT_EXCEL, MimeType.CSV, MimeType.GOOGLE_SHEETS];

/**
 * Valida que el parámetro sea un objeto GoogleAppsScript.DriveApp.Folder válido.
 * 
 * @param {*} folder - Parámetro a validar.
 * @returns {boolean} true si es un Folder válido, false en caso contrario.
 */
function isFolder(folder) {
  return this._validate(folder, ['getId', 'getName', 'getUrl', 'getFiles', 'getFilesByType'])
}

/**
 * Valida que el parámetro sea un objeto GoogleAppsScript.DriveApp.File válido.
 * @param {*} file - Objeto a validar.
 * @returns {boolean} true si es un File válido, false en caso contrario.
 */
function isFile(file) {
  return this._validate(file, ['getId', 'getName', 'getUrl', 'getBlob', 'getMimeType'])
}

/**
 * Obtiene archivos de una carpeta filtrados por tipo MIME y opcionalmente ordenados.
 * 
 * @param {GoogleAppsScript.DriveApp.Folder} folder - Carpeta donde buscar los archivos.
 * @param {string} mimeType - Tipo MIME de los archivos a buscar (ej. 'application/vnd.google-apps.spreadsheet').
 * @param {function(GoogleAppsScript.DriveApp.File, GoogleAppsScript.DriveApp.File): number} [orderingFn] - Función personalizada para ordenar (opcional).
 * @returns {GoogleAppsScript.DriveApp.File[]} - Array de archivos encontrados (vacío si no hay resultados)
 */
function getFilesFromFolder(folder, mimeType, orderingFn = undefined) {
  if (!isFolder(folder)) {
    throw new Error('El parámetro "folder" no es válido.');
  }

  if (!mimeTypes.includes(mimeType)) {
    throw new Error('El parámetro "mimeType" no es válido.');
  }

  try {
    const files = [];
    const fileIterator = folder.getFilesByType(mimeType);

    if (!fileIterator.hasNext()) return files;

    while (fileIterator.hasNext()) {
      files.push(fileIterator.next());
    }

    // Ordenar los archivos
    if (orderingFn && typeof orderingFn === 'function') {
      files.sort(orderingFn);
    } else {
      // Orden por defecto (alfabético por nombre)
      files.sort((a, b) => a.getName().localeCompare(b.getName()));
    }

    return files;
  } catch (error) {
    console.error('Error en getFilesFromFolder:', error.message);
    throw error;
  }
}

/**
 * Devuelve la subcarpeta con el nombre proporcionado dentro de la carpeta padre. Si no la
 * encuentra, la crea.
 * 
 * @param {GoogleAppsScript.DriveApp.Folder} parentFolder Carpeta padre.
 * @param {string} subfolderName Nombre de la subcarpeta a buscar.
 * @returns {DriveApp.folder} Subcarpeta.
 */
function getOrCreateSubfolderFrom(parentFolder, subfolderName) {
  if (!isFolder(parentFolder)) {
    throw new Error('Parámetro "parentFolder" no es una carpeta válida');
  }

  if (typeof subfolderName !== 'string' || subfolderName.trim() === '') {
    throw new Error('El parámetro "subfolderName" no es un texto válido');
  }

  try {
    const subfolders = parentFolder.getFoldersByName(subfolderName);
    return subfolders.hasNext() ? subfolders.next() : parentFolder.createFolder(subfolderName);

  } catch (error) {
    console.error('Error en getOrCreateSubfolderFrom:', error.message);
    throw error;
  }
}

/**
 * Realiza una copia de respaldo del archivo a la carpeta indicada.
 * 
 * @param {GoogleAppsScript.DriveApp.File} file Archivo a respaldar.
 * @param {GoogleAppsScript.DriveApp.Folder} backupFolder Carpeta de respaldo.
 * @param {string} prefix Prefijo del nombre del archivo.
 * @returns {string} Nombre del archivo de respaldo creado.
 */
function backupFileTo(file, backupFolder, prefix=null) {
  if (!isFile(file)) {
    throw new Error('Parámetro "file" no es un archivo válido');
  }

  if (!isFolder(backupFolder)) {
    throw new Error('Parámetro "backupFolder" no es una carpeta válida');
  }

  try {
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `${prefix ?? 'Respaldo'} ${file.getName()} ${date}`;
    file.makeCopy(backupFileName, backupFolder);
    return backupFileName;

  } catch (error) {
    console.error('Error en backupFileTo:', error.message);
    throw error;
  }
}

/**
 * Mueve un archivo a una carpeta.
 * 
 * @param {GoogleAppsScript.DriveApp.File} file Archivo a mover.
 * @param {GoogleAppsScript.DriveApp.Folder} targetFolder Carpeta destino.
 */
function moveFileToFolder(file, targetFolder) {
  if (!isFile(file)) {
    throw new Error('Parámetro "file" no es un archivo válido');
  }

  if (!isFolder(targetFolder)) {
    throw new Error('Parámetro "targetFolder" no es una carpeta válida');
  }

  try {
    const parents = file.getParents();
    const previousParents = [];
    while (parents.hasNext()) {
      previousParents.push(parents.next().getId());
    }

    Drive.Files.update(
      {},
      file.getId(),
      null, {
        addParents: targetFolder.getId(),
        removeParents: previousParents.join(',')
      },
    );

  } catch {
    console.error(`El archivo ${file.getName()} no puede moverse a la carpeta ${targetFolder.getName()}. No se tienen los permisos suficientes.`);
  }
}

/**
 * Convierte un archivo a formato Google Sheet.
 * 
 * @param {GoogleAppsScript.DriveApp.File} file Archivo a convertir.
 * @returns {GoogleAppsScript.DriveApp.File} Archivo convertido.
 * @throws {Error} Si falla la conversión.
 */
function convertFileToGoogleSheet(file) {
  if (!isFile(file)) {
    throw new Error('Parámetro "file" no es un archivo válido');
  }

  try {
    const iterator = file.getParents();
    const convertedFile = Drive.Files.create(
      {
        name: file.getName().replace(/\.xlsx?$/, ''),
        mimeType: MimeType.GOOGLE_SHEETS,
        parents: [iterator.hasNext() ? iterator.next().getId() : null]
      },
      file.getBlob(),
      {
        convert: true
      }
    );

    return DriveApp.getFileById(convertedFile.id);

  } catch (error) {
    console.error('Error en convertFileToGoogleSheet:', error.message);
    throw error;
  }
}
