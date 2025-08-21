// === Mocks ===
class MockFile {
  constructor(name, mimeType = MimeType.CSV) {
    this.name = name;
    this.mimeType = mimeType;
    this.parentFolders = [];
    this.copies = [];
  }

  getId() { return `id-${this.name}`; }
  getName() { return this.name; }
  getUrl() { return `url-${this.name}`; }
  getBlob() { return {}; }
  getMimeType() { return this.mimeType; }
  getParents() {
    let i = 0;
    return {
      hasNext: () => i < this.parentFolders.length,
      next: () => this.parentFolders[i++]
    };
  }
  makeCopy(name, folder) {
    this.copies.push({ name, folder });
    return new MockFile(name);
  }
}

class MockFolder {
  constructor(name) {
    this.name = name;
    this.files = [];
    this.subfolders = [];
  }

  getId() { return `id-${this.name}`; }
  getName() { return this.name; }
  getUrl() { return `url-${this.name}`; }
  getFiles() {
    let i = 0;
    return {
      hasNext: () => i < this.files.length,
      next: () => this.files[i++]
    };
  }
  getFilesByType(mimeType) {
    let filtered = this.files.filter(f => f.getMimeType() === mimeType);
    let i = 0;
    return {
      hasNext: () => i < filtered.length,
      next: () => filtered[i++]
    };
  }
  getFoldersByName(name) {
    let filtered = this.subfolders.filter(f => f.getName() === name);
    let i = 0;
    return {
      hasNext: () => i < filtered.length,
      next: () => filtered[i++]
    };
  }
  createFolder(name) {
    const f = new MockFolder(name);
    this.subfolders.push(f);
    return f;
  }
}

// === Tests ===
function _runDriveUtilsTests() {
  console.log(`=== UTILIDADES DRIVE ===`);

  describe("isFolder", function() {
    it("Detecta correctamente un Folder válido", function() {
      const folder = new MockFolder("Test");
      assertTrue(isFolder(folder));
    });

    it("Retorna false si no es Folder", function() {
      assertFalse(isFolder(null));
      assertFalse(isFolder({}));
    });
  });

  describe("isFile", function() {
    it("Detecta correctamente un File válido", function() {
      const file = new MockFile("file1");
      assertTrue(isFile(file));
    });

    it("Retorna false si no es File", function() {
      assertFalse(isFile(null));
      assertFalse(isFile({}));
    });
  });

  describe("getFilesFromFolder", function() {
    it("Retorna archivos filtrados por mimeType y ordenados por nombre", function() {
      const folder = new MockFolder("folder1");
      const fileA = new MockFile("b_file", MimeType.CSV);
      const fileB = new MockFile("a_file", MimeType.CSV);
      folder.files.push(fileA, fileB);

      const files = getFilesFromFolder(folder, MimeType.CSV);
      assertEquals(files[0].getName(), "a_file");
      assertEquals(files[1].getName(), "b_file");
    });

    it("Lanza error si folder no es válido", function() {
      assertFunctionParams(getFilesFromFolder, [null, MimeType.CSV], true, 'El parámetro "folder" no es válido.');
    });

    it("Lanza error si mimeType no es válido", function() {
      const folder = new MockFolder("folder2");
      assertFunctionParams(getFilesFromFolder, [folder, ""], true, 'El parámetro "mimeType" no es válido.');
    });

    it("Aplica función de ordenamiento alfabético predeterminada", function() {
      const folder = new MockFolder("folder3");
      const f1 = new MockFile("c", MimeType.CSV);
      const f2 = new MockFile("a", MimeType.CSV);
      const f3 = new MockFile("b", MimeType.CSV);
      folder.files.push(f1, f2, f3);

      const files = getFilesFromFolder(folder, MimeType.CSV);
      assertEquals(files.map(f=>f.getName()).join(","), "a,b,c");
    });

    it("Aplica función de ordenamiento personalizada (orden alfabético inverso)", function() {
      const folder = new MockFolder("folder3");
      const f1 = new MockFile("c", MimeType.CSV);
      const f2 = new MockFile("a", MimeType.CSV);
      const f3 = new MockFile("b", MimeType.CSV);
      folder.files.push(f1, f2, f3);

      const files = getFilesFromFolder(folder, MimeType.CSV, (x,y)=> y.getName().localeCompare(x.getName()));
      assertEquals(files.map(f=>f.getName()).join(","), "c,b,a");
    });

  });

  describe("getOrCreateSubfolderFrom", function() {
    it("Devuelve subfolder existente", function() {
      const parent = new MockFolder("parent");
      const sub = parent.createFolder("sub");
      const result = getOrCreateSubfolderFrom(parent, "sub");
      assertEquals(result, sub);
    });

    it("Crea subfolder si no existe", function() {
      const parent = new MockFolder("parent2");
      const result = getOrCreateSubfolderFrom(parent, "newSub");
      assertEquals(result.getName(), "newSub");
      assertTrue(parent.subfolders.includes(result));
    });

    it("Lanza error si parentFolder no es válido", function() {
      assertFunctionParams(getOrCreateSubfolderFrom, [null,"x"], true, 'Parámetro "parentFolder" no es una carpeta válida');
    });
  });

  describe("backupFileTo", function() {
    it("Crea copia de respaldo con prefijo", function() {
      const file = new MockFile("file");
      const folder = new MockFolder("backup");
      const backupName = backupFileTo(file, folder, "PRE");
      assertTrue(backupName.startsWith("PRE file"));
      assertEquals(file.copies.length, 1);
      assertEquals(file.copies[0].name, backupName);
    });
  });

  describe("moveFileToFolder", function() {
    it("Lanza error si file o folder no son válidos", function() {
      assertFunctionParams(moveFileToFolder, [null, new MockFolder("x")], true);
      assertFunctionParams(moveFileToFolder, [new MockFile("f"), null], true);
    });
  });

  describe("convertFileToGoogleSheet", function() {
    it("Lanza error si file no es válido", function() {
      assertFunctionParams(convertFileToGoogleSheet, [null], true);
    });
  });

}
