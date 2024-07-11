"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateAccreditation = exports.searchAccreditation = exports.getAccreditations = exports.getAccreditationById = exports.filterByYears = exports.deleteAccreditation = exports.createAccreditation = void 0;
require("core-js/modules/es.parse-int.js");
require("core-js/modules/es.promise.js");
require("core-js/modules/es.regexp.exec.js");
require("core-js/modules/es.string.search.js");
var _AccreditationModel = _interopRequireDefault(require("../models/AccreditationModel.js"));
var _path = _interopRequireDefault(require("path"));
var _fs = _interopRequireDefault(require("fs"));
var _sequelize = require("sequelize");
var { PDFDocument, rgb } = require("pdf-lib");
var QRCode = require("qrcode");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const getAccreditations = async (req, res) => {
  try {
    const Accreditationss = await _AccreditationModel.default.findAll();
    res.status(200).json(Accreditationss);
  } catch (error) {
    console.log(error.message);
  }
};
exports.getAccreditations = getAccreditations;
const getAccreditationById = async (req, res) => {
  try {
    const accreditations = await _AccreditationModel.default.findByPk(req.params.id);
    res.status(200).json(accreditations);
  } catch (error) {
    console.log(error.message);
  }
};
exports.getAccreditationById = getAccreditationById;
const createAccreditation = async (req, res) => {
  try {
    const {
      nama,
      startDate,
      typeId,
      subtypeId
    } = req.body;
    const file = req.files.file;
    if (nama === "" || startDate === "" || typeId === "" || subtypeId === "") {
      return res.status(400).json("Semua field harus diisi");
    }
    const existingFiles = await _AccreditationModel.default.findAll({
      attributes: ["file_name"]
    });
    const fileExt = _path.default.extname(file.name).toLowerCase();
    const isDuplicateName = existingFiles.some(existingFile => existingFile.file_name === "".concat(nama).concat(fileExt));
    if (isDuplicateName) {
      return res.status(400).json("Nama file sudah terdapat dalam database gunakan nama file yang berbeda.");
    }
    const fileUrl = "file/accreditations/".concat(nama).concat(fileExt);
    await _AccreditationModel.default.create({
      categoriesId: 1,
      typeId: typeId,
      subtypeId: subtypeId,
      file_name: nama + fileExt,
      file_url: fileUrl,
      start_date: startDate
    });
    await file.mv("./public/file/accreditations/".concat(nama).concat(fileExt));
    if (fileExt === ".pdf") {
      const qrCodeDataUrl = await QRCode.toDataURL(
        `https://api.simdoks.web.id/${fileUrl}`
      );

      const existingPdfBytes = _fs.default.readFileSync(
        `./public/file/accreditations/${nama}${fileExt}`
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
        `./public/file/accreditations/${nama}${fileExt}`,
        pdfBytes
      );
    }
    res.status(201).json("Accreditation berhasil ditambahkan");
  } catch (error) {
    console.log(error.message);
  }
};
exports.createAccreditation = createAccreditation;
const updateAccreditation = async (req, res) => {
  try {
    const {
      nama,
      startDate,
      typeId,
      subtypeId
    } = req.body;
    const file = req.files.file;
    if (nama === "" || startDate === "" || typeId === "" || subtypeId === "") {
      return res.status(400).json("Semua field harus diisi");
    }
    const existingFiles = await _AccreditationModel.default.findAll({
      attributes: ["file_name"]
    });
    const fileExt = _path.default.extname(file.name).toLowerCase();
    const isDuplicateName = existingFiles.some(existingFile => existingFile.file_name === "".concat(nama).concat(fileExt));
    if (isDuplicateName) {
      return res.status(400).json("Nama file sudah terdapat dalam database gunakan nama file yang berbeda.");
    }
    const fileUrl = "file/accreditations/".concat(nama).concat(fileExt);
    const previousAccreditations = await _AccreditationModel.default.findByPk(req.params.id);
    if (previousAccreditations) {
      const previousFileUrl = "./public/".concat(previousAccreditations.file_url);
      if (_fs.default.existsSync(previousFileUrl)) {
        _fs.default.unlinkSync(previousFileUrl);
      }
    }
    await _AccreditationModel.default.update({
      categoriesId: 1,
      typeId: typeId,
      subtypeId: subtypeId,
      file_name: nama + fileExt,
      file_url: fileUrl,
      start_date: startDate
    }, {
      where: {
        id: req.params.id
      }
    });
    await file.mv("./public/file/accreditations/".concat(nama).concat(fileExt));
    if (fileExt === ".pdf") {
      const qrCodeDataUrl = await QRCode.toDataURL(
        `https://api.simdoks.web.id/${fileUrl}`
      );

      const existingPdfBytes = _fs.default.readFileSync(
        `./public/file/accreditations/${nama}${fileExt}`
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
        `./public/file/accreditations/${nama}${fileExt}`,
        pdfBytes
      );
    }
    res.status(200).json("Accreditation berhasil diupdate");
  } catch (error) {
    console.log(error.message);
  }
};
exports.updateAccreditation = updateAccreditation;
const deleteAccreditation = async (req, res) => {
  try {
    const accreditations = await _AccreditationModel.default.findByPk(req.params.id);
    const filePath = _path.default.join(process.cwd(), "public/".concat(accreditations.file_url));
    _fs.default.unlink(filePath, async () => {
      await _AccreditationModel.default.destroy({
        where: {
          id: req.params.id
        }
      });
      res.status(200).json("Accreditation berhasil dihapus");
    });
  } catch (error) {
    console.log(error.message);
  }
};
exports.deleteAccreditation = deleteAccreditation;
const searchAccreditation = async (req, res) => {
  try {
    const accreditation = await _AccreditationModel.default.findAll({
      where: {
        typeId: req.query.typeId,
        subtypeId: req.query.subtypeId,
        file_name: {
          [_sequelize.Op.like]: "%".concat(req.query.search, "%")
        }
      }
    });
    res.status(200).json(accreditation);
  } catch (error) {
    console.log(error.message);
  }
};
exports.searchAccreditation = searchAccreditation;
const filterByYears = async (req, res) => {
  try {
    const {
      typeId,
      subtypeId,
      years
    } = req.query;
    const startDate = "".concat(years, "-01-01");
    const endDate = "".concat(parseInt(years) + 1, "-01-01");
    const accreditation = await _AccreditationModel.default.findAll({
      where: {
        typeId: typeId,
        start_date: {
          [_sequelize.Op.between]: [startDate, endDate]
        }
      }
    });
    res.status(200).json(accreditation);
  } catch (error) {
    console.log(error.message);
  }
};
exports.filterByYears = filterByYears;
const renameAccreditations = async (req, res) => {
  try {
    const { id, nama } = req.query;
    const old_accreditation = await _AccreditationModel.default.findByPk(id);

    if (!old_accreditation) {
      return res.status(404).json({ error: "Accreditation not found" });
    }
    if (!nama) {
      return res.status(400).json({ error: "Nama tidak boleh kosong" });
    }
    const existingFiles = await _AccreditationModel.default.findAll({
      attributes: ["file_name"]
    });
    const fileExt = _path.default.extname(old_accreditation.file_name).toLowerCase();
    const fileUrl = `file/accreditations/${nama}${fileExt}`;
    const isDuplicateName = existingFiles.some(existingFile => existingFile.file_name === "".concat(nama).concat(fileExt));
    if (isDuplicateName) {
      return res.status(400).json("Nama file sudah terdapat dalam database gunakan nama file yang berbeda.");
    }
    // Ubah nama file di database
    await _AccreditationModel.default.update({
      file_name: `${nama}${fileExt}`,
      file_url: fileUrl
    }, {
      where: { id: id }
    });

    // Ubah nama file di direktori publik
    const oldFilePath = _path.default.join(__dirname, '..', 'public', old_accreditation.file_url);
    const newFilePath = _path.default.join(__dirname, '..', 'public', fileUrl);
    _fs.default.renameSync(oldFilePath, newFilePath);
    if (fileExt === ".pdf") {
      const qrCodeDataUrl = await QRCode.toDataURL(
        `https://api.simdoks.web.id/${fileUrl}`
      );

      const existingPdfBytes = _fs.default.readFileSync(
        `./public/file/accreditations/${nama}${fileExt}`
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
        `./public/file/accreditations/${nama}${fileExt}`,
        pdfBytes
      );
    }

    res.status(200).json("Accreditation berhasil diupdate");
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
};
exports.renameAccreditations = renameAccreditations;