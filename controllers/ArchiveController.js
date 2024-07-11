"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateArchive = exports.searchArchive = exports.getArchivesBySubtypeId = exports.getArchives = exports.getArchiveById = exports.filterByYears = exports.deleteArchive = exports.createArchive = exports.autoDeleteArchive = void 0;
require("core-js/modules/es.promise.js");
require("core-js/modules/es.regexp.exec.js");
require("core-js/modules/es.string.search.js");
require("core-js/modules/web.dom-collections.iterator.js");
var _ArchiveModel = _interopRequireDefault(require("../models/ArchiveModel.js"));
var _path = _interopRequireDefault(require("path"));
var _fs = _interopRequireDefault(require("fs"));
var _sequelize = require("sequelize");
var { PDFDocument, rgb } = require("pdf-lib");
var QRCode = require("qrcode");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const getArchives = async (req, res) => {
  try {
    const Archive = await _ArchiveModel.default.findAll();
    res.status(200).json(Archive);
  } catch (error) {
    console.log(error.message);
  }
};
exports.getArchives = getArchives;
const getArchiveById = async (req, res) => {
  try {
    const archive = await _ArchiveModel.default.findByPk(req.params.id);
    res.status(200).json(archive);
  } catch (error) {
    console.log(error.message);
  }
};
exports.getArchiveById = getArchiveById;
const createArchive = async (req, res) => {
  try {
    const {
      nama,
      typeId,
      subtypeId,
      startDate
    } = req.body;
    const file = req.files.file;
    if (nama === "" || typeId === "" || startDate === "") {
      return res.status(400).json("Semua field harus diisi");
    }
  
    const existingFiles = await _ArchiveModel.default.findAll({
      attributes: ["file_name"]
    });
    const fileExt = _path.default.extname(file.name).toLowerCase();
    const isDuplicateName = existingFiles.some(existingFile => existingFile.file_name === "".concat(nama).concat(fileExt));
    if (isDuplicateName) {
      return res.status(400).json("Nama file sudah terdapat dalam database gunakan nama file yang berbeda.");
    }
    const fileUrl = "file/archives/".concat(nama).concat(fileExt);
    const date = new Date(startDate);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    const fiveYearsLater = new Date(date);
    fiveYearsLater.setFullYear(date.getFullYear() + 5);
    if(fiveYearsLater < new Date()){
      return res.status(400).json("End date must be greater than current date");
    }
    await _ArchiveModel.default.create({
      categoriesId: 5,
      typeId: typeId,
      subtypeId: subtypeId,
      file_name: nama + fileExt,
      file_url: fileUrl,
      start_date: date,
      end_date: fiveYearsLater
    });
    await file.mv("./public/file/archives/".concat(nama).concat(fileExt));
    if (fileExt === ".pdf") {
      const qrCodeDataUrl = await QRCode.toDataURL(
        `https://api.simdoks.web.id/${fileUrl}`
      );

      const existingPdfBytes = _fs.default.readFileSync(
        `./public/file/archives/${nama}${fileExt}`
      );
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const page = pdfDoc.getPage(0);

      const qrCodeImage = await pdfDoc.embedPng(qrCodeDataUrl);
      const { width, height } = page.getSize();
      const qrCodeWidth = 56;
      const qrCodeHeight = 56;
      const x = width - qrCodeWidth - 7;
      const y = height - qrCodeHeight - 7;

      page.drawImage(qrCodeImage, {
        x,
        y,
        width: qrCodeWidth,
        height: qrCodeHeight,
      });

      page.drawRectangle({
        x: x - 1,
        y: y - 1,
        width: qrCodeWidth + 2,
        height: qrCodeHeight + 2,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      const pdfBytes = await pdfDoc.save();
      _fs.default.writeFileSync(
        `./public/file/archives/${nama}${fileExt}`,
        pdfBytes
      );
    }
    res.status(201).json("Archive berhasil ditambahkan");
  } catch (error) {
    console.log(error.message);
  }
};
exports.createArchive = createArchive;
const updateArchive = async (req, res) => {
  try {
    const {
      nama,
      startDate,
      typeId,
      subtypeId
    } = req.body;
    const file = req.files.file;
    if (nama === "" || startDate === "" || typeId === "") {
      return res.status(400).json("Semua field harus diisi");
    }
    const existingFiles = await _ArchiveModel.default.findAll({
      attributes: ["file_name"]
    });
    const fileExt = _path.default.extname(file.name).toLowerCase();
    const isDuplicateName = existingFiles.some(existingFile => existingFile.file_name === "".concat(nama).concat(fileExt));
    if (isDuplicateName) {
      return res.status(400).json("Nama file sudah terdapat dalam database gunakan nama file yang berbeda.");
    }
    const fileUrl = "file/archives/".concat(nama).concat(fileExt);
    const previousArchives = await _ArchiveModel.default.findByPk(
      req.params.id
    );
    if (previousArchives) {
      const previousFileUrl = "./public/".concat(previousArchives.file_url);
      if (_fs.default.existsSync(previousFileUrl)) {
        _fs.default.unlinkSync(previousFileUrl);
      }
    }
    const date = new Date(startDate);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    const fiveYearsLater = new Date(date);
    fiveYearsLater.setFullYear(date.getFullYear() + 5);
    if(fiveYearsLater < new Date()){
      return res.status(400).json("End date must be greater than current date");
    }
    await _ArchiveModel.default.update({
      categoriesId: 5,
      typeId: typeId,
      subtypeId: subtypeId,
      file_name: nama + fileExt,
      file_url: fileUrl,
      start_date: date,
      end_date: fiveYearsLater
    }, {
      where: {
        id: req.params.id
      }
    });
    await file.mv("./public/file/archives/".concat(nama).concat(fileExt));
    if (fileExt === ".pdf") {
      const qrCodeDataUrl = await QRCode.toDataURL(
        `https://api.simdoks.web.id/${fileUrl}`
      );

      const existingPdfBytes = _fs.default.readFileSync(
        `./public/file/archives/${nama}${fileExt}`
      );
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const page = pdfDoc.getPage(0);

      const qrCodeImage = await pdfDoc.embedPng(qrCodeDataUrl);
      const { width, height } = page.getSize();
      const qrCodeWidth = 56;
      const qrCodeHeight = 56;
      const x = width - qrCodeWidth - 7;
      const y = height - qrCodeHeight - 7;

      page.drawImage(qrCodeImage, {
        x,
        y,
        width: qrCodeWidth,
        height: qrCodeHeight,
      });

      page.drawRectangle({
        x: x - 1,
        y: y - 1,
        width: qrCodeWidth + 2,
        height: qrCodeHeight + 2,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      const pdfBytes = await pdfDoc.save();
      _fs.default.writeFileSync(
        `./public/file/archives/${nama}${fileExt}`,
        pdfBytes
      );
    }
    res.status(200).json("Archive berhasil diupdate");
  } catch (error) {
    console.log(error.message);
  }
};
exports.updateArchive = updateArchive;
const deleteArchive = async (req, res) => {
  try {
    const archive = await _ArchiveModel.default.findByPk(req.params.id);
    const fileUrl = "./public/".concat(archive.file_url);
    if (_fs.default.existsSync(fileUrl)) {
      _fs.default.unlinkSync(fileUrl);
    }
    await _ArchiveModel.default.destroy({
      where: {
        id: req.params.id
      }
    });
    res.status(200).json("Archive berhasil dihapus");
  } catch (error) {
    console.log(error.message);
  }
};
exports.deleteArchive = deleteArchive;
const getArchivesBySubtypeId = async (req, res) => {
  try {
    const {
      subtypeId,
      typeId
    } = req.body;
    let archives = "";
    if (subTypeId) {
      archives = await _ArchiveModel.default.findAll({
        where: {
          subtypeId: subtypeId,
          typeId: typeId
        }
      });
    } else {
      archives = await _ArchiveModel.default.findAll({
        where: {
          typeId: typeId
        }
      });
    }
    res.status(200).json(archives);
  } catch (error) {
    console.log(error.message);
  }
};
exports.getArchivesBySubtypeId = getArchivesBySubtypeId;
const filterByYears = async (req, res) => {
  try {
    const {
      typeId,
      subtypeId,
      years
    } = req.query;
    let archives = "";
    if (subtypeId) {
      archives = await _ArchiveModel.default.findAll({
        where: {
          typeId: typeId,
          subtypeId: subtypeId,
          start_date: {
            [_sequelize.Op.between]: ["".concat(years, "-01-01"), "".concat(years, "-12-31")]
          }
        }
      });
    } else {
      archives = await _ArchiveModel.default.findAll({
        where: {
          typeId: typeId,
          start_date: {
            [_sequelize.Op.between]: ["".concat(years, "-01-01"), "".concat(years, "-12-31")]
          }
        }
      });
    }
    res.status(200).json(archives);
  } catch (error) {
    console.log(error.message);
  }
};
exports.filterByYears = filterByYears;
const searchArchive = async (req, res) => {
  try {
    const {
      search,
      typeId,
      subtypeId
    } = req.query;
    let archives = "";
    if (subtypeId) {
      archives = await _ArchiveModel.default.findAll({
        where: {
          file_name: {
            [_sequelize.Op.like]: "%".concat(search, "%")
          },
          typeId: typeId,
          subtypeId: subtypeId
        }
      });
    } else {
      archives = await _ArchiveModel.default.findAll({
        where: {
          file_name: {
            [_sequelize.Op.like]: "%".concat(search, "%")
          },
          typeId: typeId
        }
      });
    }
    res.status(200).json(archives);
  } catch (error) {
    console.log(error.message);
  }
};
exports.searchArchive = searchArchive;
const autoDeleteArchive = async () => {
  try {
    const expiredArchives = await _ArchiveModel.default.findAll({
      where: {
        end_date: {
          [_sequelize.Op.lt]: new Date()
        }
      }
    });
    await Promise.all(expiredArchives.map(async archive => {
      const filePath = _path.default.join("public/", archive.file_url);
      await archive.destroy();
      _fs.default.unlinkSync(filePath);
    }));
    console.log("Pengecekan dan penghapusan berhasil dilakukan.");
  } catch (error) {
    console.error("Gagal melakukan pengecekan dan penghapusan:", error);
  }
};
exports.autoDeleteArchive = autoDeleteArchive;

const renameArchives = async (req, res) => {
  try {
    const { id, nama } = req.query;
    const old_archive = await _ArchiveModel.default.findByPk(id);

    if (!old_archive) {
      return res.status(404).json({ error: "Archive not found" });
    }
    if (!nama) {
      return res.status(400).json({ error: "Nama tidak boleh kosong" });
    }
    const existingFiles = await _ArchiveModel.default.findAll({
      attributes: ["file_name"]
    });
    const fileExt = _path.default.extname(old_archive.file_name).toLowerCase();
    const fileUrl = `file/archives/${nama}${fileExt}`;
    const isDuplicateName = existingFiles.some(existingFile => existingFile.file_name === "".concat(nama).concat(fileExt));
    if (isDuplicateName) {
      return res.status(400).json("Nama file sudah terdapat dalam database gunakan nama file yang berbeda.");
    }
    // Ubah nama file di database
    await _ArchiveModel.default.update({
      file_name: `${nama}${fileExt}`,
      file_url: fileUrl
    }, {
      where: { id: id }
    });

    // Ubah nama file di direktori publik
    const oldFilePath = _path.default.join(__dirname, '..', 'public', old_archive.file_url);
    const newFilePath = _path.default.join(__dirname, '..', 'public', fileUrl);
    _fs.default.renameSync(oldFilePath, newFilePath);
    if (fileExt === ".pdf") {
      const qrCodeDataUrl = await QRCode.toDataURL(
        `https://api.simdoks.web.id/${fileUrl}`
      );

      const existingPdfBytes = _fs.default.readFileSync(
        `./public/file/archives/${nama}${fileExt}`
      );
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const page = pdfDoc.getPage(0);

      const qrCodeImage = await pdfDoc.embedPng(qrCodeDataUrl);
      const { width, height } = page.getSize();
      const qrCodeWidth = 56;
      const qrCodeHeight = 56;
      const x = width - qrCodeWidth - 7;
      const y = height - qrCodeHeight - 7;

      page.drawImage(qrCodeImage, {
        x,
        y,
        width: qrCodeWidth,
        height: qrCodeHeight,
      });

      page.drawRectangle({
        x: x - 1,
        y: y - 1,
        width: qrCodeWidth + 2,
        height: qrCodeHeight + 2,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      const pdfBytes = await pdfDoc.save();
      _fs.default.writeFileSync(
        `./public/file/archives/${nama}${fileExt}`,
        pdfBytes
      );
    }

    res.status(200).json("Archive berhasil diupdate");
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
}
exports.renameArchives = renameArchives;