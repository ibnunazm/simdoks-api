"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.updateFinance =
  exports.searchFinance =
  exports.getFinances =
  exports.getFinanceById =
  exports.filterByYears =
  exports.deleteFinance =
  exports.createFinance =
  exports.autoDeleteFinance =
    void 0;
require("core-js/modules/es.parse-int.js");
require("core-js/modules/es.promise.js");
require("core-js/modules/es.regexp.exec.js");
require("core-js/modules/es.string.search.js");
require("core-js/modules/web.dom-collections.iterator.js");
var _FinanceModel = _interopRequireDefault(
  require("../models/FinanceModel.js")
);
var _path = _interopRequireDefault(require("path"));
var _fs = _interopRequireDefault(require("fs"));
var _sequelize = require("sequelize");
var { PDFDocument, rgb } = require("pdf-lib");
var QRCode = require("qrcode");
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
const getFinances = async (req, res) => {
  try {
    const finances = await _FinanceModel.default.findAll();
    res.status(200).json(finances);
  } catch (error) {
    console.log(error.message);
  }
};
exports.getFinances = getFinances;
const getFinanceById = async (req, res) => {
  try {
    const finance = await _FinanceModel.default.findByPk(req.params.id);
    res.status(200).json(finance);
  } catch (error) {
    console.log(error.message);
  }
};
exports.getFinanceById = getFinanceById;
const createFinance = async (req, res) => {
  try {
    const { nama, typeId, startDate } = req.body;
    const file = req.files.file;
    if (nama === "" || typeId === "" || startDate === "") {
      return res.status(400).json("Semua field harus diisi");
    }
    const existingFiles = await _FinanceModel.default.findAll({
      attributes: ["file_name"],
    });
    const fileExt = _path.default.extname(file.name).toLowerCase();
    const isDuplicateName = existingFiles.some(
      (existingFile) =>
        existingFile.file_name === "".concat(nama).concat(fileExt)
    );
    if (isDuplicateName) {
      return res
        .status(400)
        .json(
          "Nama file sudah terdapat dalam database gunakan nama file yang berbeda."
        );
    }
    const fileUrl = "file/finances/".concat(nama).concat(fileExt);
    const date = new Date(startDate);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    const twentyYearLater = new Date(date);
    twentyYearLater.setFullYear(date.getFullYear() + 20);
    if (twentyYearLater < new Date()) {
      return res.status(400).json("End date must be greater than current date");
    }
    await _FinanceModel.default.create({
      categoriesId: 6,
      typeId: typeId,
      file_name: nama + fileExt,
      file_url: fileUrl,
      start_date: date,
      end_date: twentyYearLater,
    });
    await file.mv("./public/file/finances/".concat(nama).concat(fileExt));
    if (fileExt === ".pdf") {
      const qrCodeDataUrl = await QRCode.toDataURL(
        `https://api.simdoks.web.id/${fileUrl}`
      );

      const existingPdfBytes = _fs.default.readFileSync(
        `./public/file/finances/${nama}${fileExt}`
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
        `./public/file/finances/${nama}${fileExt}`,
        pdfBytes
      );
    }
    res.status(201).json("Finance berhasil ditambahkan");
  } catch (error) {
    console.log(error.message);
  }
};
exports.createFinance = createFinance;
const updateFinance = async (req, res) => {
  try {
    const { nama, typeId, file_url, startDate } = req.body;
    const file = req.files.file;
    if (nama === "" || typeId === "" || file_url === "" || startDate === "") {
      return res.status(400).json("Semua field harus diisi");
    }
    const existingFiles = await _FinanceModel.default.findAll({
      attributes: ["file_name"],
    });
    const fileExt = _path.default.extname(file.name).toLowerCase();
    const isDuplicateName = existingFiles.some(
      (existingFile) =>
        existingFile.file_name === "".concat(nama).concat(fileExt)
    );
    if (isDuplicateName) {
      return res
        .status(400)
        .json(
          "Nama file sudah terdapat dalam database gunakan nama file yang berbeda."
        );
    }
    const fileUrl = "file/finances/".concat(nama).concat(fileExt);
    const previousFinances = await _FinanceModel.default.findByPk(
      req.params.id
    );
    if (previousFinances) {
      const previousFileUrl = "./public/".concat(previousFinances.file_url);
      if (_fs.default.existsSync(previousFileUrl)) {
        _fs.default.unlinkSync(previousFileUrl);
      }
    }
    const date = new Date(startDate);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    const twentyYearLater = new Date(date);
    twentyYearLater.setFullYear(date.getFullYear() + 20);
    if (twentyYearLater < new Date()) {
      return res.status(400).json("End date must be greater than current date");
    }
    await _FinanceModel.default.update(
      {
        categoriesId: 6,
        typeId: typeId,
        file_name: nama + fileExt,
        file_url: fileUrl,
        start_date: date,
        end_date: twentyYearLater,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    await file.mv("./public/file/finances/".concat(nama).concat(fileExt));
    if (fileExt === ".pdf") {
      const qrCodeDataUrl = await QRCode.toDataURL(
        `https://api.simdoks.web.id/${fileUrl}`
      );

      const existingPdfBytes = _fs.default.readFileSync(
        `./public/file/finances/${nama}${fileExt}`
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
        `./public/file/finances/${nama}${fileExt}`,
        pdfBytes
      );
    }
    res.status(200).json("Finance berhasil diupdate");
  } catch (error) {
    console.log(error.message);
  }
};
exports.updateFinance = updateFinance;
const deleteFinance = async (req, res) => {
  try {
    const finance = await _FinanceModel.default.findByPk(req.params.id);
    const fileUrl = "./public/".concat(finance.file_url);
    if (_fs.default.existsSync(fileUrl)) {
      _fs.default.unlinkSync(fileUrl);
    }
    await _FinanceModel.default.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json("Finance berhasil dihapus");
  } catch (error) {
    console.log(error.message);
  }
};
exports.deleteFinance = deleteFinance;
const searchFinance = async (req, res) => {
  try {
    const { search, typeId } = req.query;
    const finances = await _FinanceModel.default.findAll({
      where: {
        file_name: {
          [_sequelize.Op.like]: "%".concat(search, "%"),
        },
        typeId: typeId,
      },
    });
    res.status(200).json(finances);
  } catch (error) {
    console.log(error.message);
  }
};
exports.searchFinance = searchFinance;
const filterByYears = async (req, res) => {
  try {
    const { typeId, years } = req.query;
    const startDate = "".concat(years, "-01-01");
    const endDate = "".concat(parseInt(years) + 1, "-01-01");
    const finances = await _FinanceModel.default.findAll({
      where: {
        typeId: typeId,
        start_date: {
          [_sequelize.Op.between]: [startDate, endDate],
        },
      },
    });
    res.status(200).json(finances);
  } catch (error) {
    console.log(error.message);
  }
};
exports.filterByYears = filterByYears;
const autoDeleteFinance = async () => {
  try {
    const expiredFinances = await _FinanceModel.default.findAll({
      where: {
        end_date: {
          [_sequelize.Op.lt]: new Date(),
        },
      },
    });
    await Promise.all(
      expiredFinances.map(async (finance) => {
        const filePath = _path.default.join("public/", finance.file_url);
        await finance.destroy();
        _fs.default.unlinkSync(filePath);
      })
    );
    console.log("Pengecekan dan penghapusan berhasil dilakukan.");
  } catch (error) {
    console.error("Gagal melakukan pengecekan dan penghapusan:", error);
  }
};
exports.autoDeleteFinance = autoDeleteFinance;

const renameFinances = async (req, res) => {
  try {
    const { id, nama } = req.query;
    const old_finance = await _FinanceModel.default.findByPk(id);

    if (!old_finance) {
      return res.status(404).json({ error: "Finance not found" });
    }
    if (!nama) {
      return res.status(400).json({ error: "Nama tidak boleh kosong" });
    }
    const existingFiles = await _FinanceModel.default.findAll({
      attributes: ["file_name"],
    });
    const fileExt = _path.default.extname(old_finance.file_name).toLowerCase();
    const fileUrl = `file/finances/${nama}${fileExt}`;
    const isDuplicateName = existingFiles.some(
      (existingFile) =>
        existingFile.file_name === "".concat(nama).concat(fileExt)
    );
    if (isDuplicateName) {
      return res
        .status(400)
        .json(
          "Nama file sudah terdapat dalam database gunakan nama file yang berbeda."
        );
    }
    // Ubah nama file di database
    await _FinanceModel.default.update(
      {
        file_name: `${nama}${fileExt}`,
        file_url: fileUrl,
      },
      {
        where: { id: id },
      }
    );

    // Ubah nama file di direktori publik
    const oldFilePath = _path.default.join(
      __dirname,
      "..",
      "public",
      old_finance.file_url
    );
    const newFilePath = _path.default.join(__dirname, "..", "public", fileUrl);
    _fs.default.renameSync(oldFilePath, newFilePath);

    if (fileExt === ".pdf") {
      const qrCodeDataUrl = await QRCode.toDataURL(
        `https://api.simdoks.web.id/${fileUrl}`
      );

      const existingPdfBytes = _fs.default.readFileSync(
        `./public/file/finances/${nama}${fileExt}`
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
        `./public/file/finances/${nama}${fileExt}`,
        pdfBytes
      );
    }

    res.status(200).json("Finance berhasil diupdate");
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};
exports.renameFinances = renameFinances;
