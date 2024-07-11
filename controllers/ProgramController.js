"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.updateProgram =
  exports.searchProgram =
  exports.getPrograms =
  exports.getProgramById =
  exports.filterByYears =
  exports.deleteProgram =
  exports.createProgram =
  exports.autoDeleteProgram =
    void 0;
require("core-js/modules/es.parse-int.js");
require("core-js/modules/es.promise.js");
require("core-js/modules/es.regexp.exec.js");
require("core-js/modules/es.string.search.js");
require("core-js/modules/web.dom-collections.iterator.js");
var _ProgramModel = _interopRequireDefault(
  require("../models/ProgramModel.js")
);
var _path = _interopRequireDefault(require("path"));
var _fs = _interopRequireDefault(require("fs"));
var _sequelize = require("sequelize");
var _nodeCron = _interopRequireDefault(require("node-cron"));
var { PDFDocument, rgb } = require("pdf-lib");
var QRCode = require("qrcode");

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
const getPrograms = async (req, res) => {
  try {
    const Programss = await _ProgramModel.default.findAll();
    res.status(200).json(Programss);
  } catch (error) {
    console.log(error.message);
  }
};
exports.getPrograms = getPrograms;
const getProgramById = async (req, res) => {
  try {
    const programs = await _ProgramModel.default.findByPk(req.params.id);
    res.status(200).json(programs);
  } catch (error) {
    console.log(error.message);
  }
};
exports.getProgramById = getProgramById;
const createProgram = async (req, res) => {
  try {
    const { nama, startDate, typeId, subtypeId } = req.body;
    const file = req.files.file;
    if (nama === "" || startDate === "" || typeId === "" || subtypeId === "") {
      return res.status(400).json("Semua field harus diisi");
    }
    const existingFiles = await _ProgramModel.default.findAll({
      attributes: ["file_name"],
    });
    const fileExt = _path.default.extname(file.name).toLowerCase();
    const isDuplicateName = existingFiles.some(
      (existingFile) => existingFile.file_name === `${nama}${fileExt}`
    );
    if (isDuplicateName) {
      return res
        .status(400)
        .json(
          "Nama file sudah terdapat dalam database gunakan nama file yang berbeda."
        );
    }
    const fileUrl = `file/programs/${nama}${fileExt}`;
    const date = new Date(startDate);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    const fiveYearLater = new Date(date);
    fiveYearLater.setFullYear(date.getFullYear() + 5);
    if (fiveYearLater < new Date()) {
      return res.status(400).json("End date must be greater than current date");
    }
    await _ProgramModel.default.create({
      categoriesId: 4,
      typeId: typeId,
      subtypeId: subtypeId,
      file_name: nama + fileExt,
      file_url: fileUrl,
      start_date: date,
      end_date: fiveYearLater,
    });
    await file.mv(`./public/file/programs/${nama}${fileExt}`);

    if (fileExt === ".pdf") {
      const qrCodeDataUrl = await QRCode.toDataURL(
        `https://api.simdoks.web.id/${fileUrl}`
      );

      const existingPdfBytes = _fs.default.readFileSync(
        `./public/file/programs/${nama}${fileExt}`
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
        `./public/file/programs/${nama}${fileExt}`,
        pdfBytes
      );
    }
    res.status(201).json("programs berhasil ditambahkan");
  } catch (error) {
    console.log(error.message);
    res.status(500).json("Terjadi kesalahan pada server");
  }
};
exports.createProgram = createProgram;
const updateProgram = async (req, res) => {
  try {
    const { nama, startDate, typeId, subtypeId } = req.body;
    const file = req.files.file;
    if (nama === "" || startDate === "" || typeId === "" || subtypeId === "") {
      return res.status(400).json("Semua field harus diisi");
    }
    const existingFiles = await _ProgramModel.default.findAll({
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
    const fileUrl = "file/programs/".concat(nama).concat(fileExt);
    const previousPrograms = await _ProgramModel.default.findByPk(
      req.params.id
    );
    if (previousPrograms) {
      const previousFileUrl = "./public/".concat(previousPrograms.file_url);
      if (_fs.default.existsSync(previousFileUrl)) {
        _fs.default.unlinkSync(previousFileUrl);
      }
    }
    const date = new Date(startDate);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    const fiveYearLater = new Date(date);
    fiveYearLater.setFullYear(date.getFullYear() + 5);
    if (fiveYearLater < new Date()) {
      return res.status(400).json("End date must be greater than current date");
    }
    await _ProgramModel.default.update(
      {
        categoriesId: 4,
        typeId: typeId,
        subtypeId: subtypeId,
        file_name: nama + fileExt,
        file_url: fileUrl,
        start_date: date,
        end_date: fiveYearLater,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    await file.mv("./public/file/programs/".concat(nama).concat(fileExt));

    if (fileExt === ".pdf") {
      const qrCodeDataUrl = await QRCode.toDataURL(
        `https://api.simdoks.web.id/${fileUrl}`
      );

      const existingPdfBytes = _fs.default.readFileSync(
        `./public/file/programs/${nama}${fileExt}`
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
        `./public/file/programs/${nama}${fileExt}`,
        pdfBytes
      );
    }
    res.status(200).json("Program berhasil diupdate");
  } catch (error) {
    console.log(error.message);
  }
};
exports.updateProgram = updateProgram;
const deleteProgram = async (req, res) => {
  try {
    const programs = await _ProgramModel.default.findByPk(req.params.id);
    const filePath = _path.default.join(
      process.cwd(),
      "public/".concat(programs.file_url)
    );
    _fs.default.unlink(filePath, async () => {
      await _ProgramModel.default.destroy({
        where: {
          id: req.params.id,
        },
      });
      res.status(200).json("Program berhasil dihapus");
    });
  } catch (error) {
    console.log(error.message);
  }
};
exports.deleteProgram = deleteProgram;
const searchProgram = async (req, res) => {
  try {
    const program = await _ProgramModel.default.findAll({
      where: {
        typeId: req.query.typeId,
        subtypeId: req.query.subtypeId,
        file_name: {
          [_sequelize.Op.like]: "%".concat(req.query.search, "%"),
        },
      },
    });
    res.status(200).json(program);
  } catch (error) {
    console.log(error.message);
  }
};
exports.searchProgram = searchProgram;
const filterByYears = async (req, res) => {
  try {
    const { typeId, subtypeId, years } = req.query;
    const startDate = "".concat(years, "-01-01");
    const endDate = "".concat(parseInt(years) + 1, "-01-01");
    const Program = await _ProgramModel.default.findAll({
      where: {
        typeId: typeId,
        subtypeId: subtypeId,
        start_date: {
          [_sequelize.Op.between]: [startDate, endDate],
        },
      },
    });
    res.status(200).json(Program);
  } catch (error) {
    console.log(error.message);
  }
};
exports.filterByYears = filterByYears;
const autoDeleteProgram = async () => {
  try {
    // Ambil semua program yang end_date-nya sudah lewat
    const expiredPrograms = await _ProgramModel.default.findAll({
      where: {
        end_date: {
          [_sequelize.Op.lt]: new Date(), // Kurang dari tanggal sekarang
        },
      },
    });

    // Hapus record dari database dan file dari direktori
    await Promise.all(
      expiredPrograms.map(async (program) => {
        // Hapus file dari direktori
        const filePath = _path.default.join("public/", program.file_url);
        console.log(filePath);
        // Hapus record dari database
        await program.destroy();
        _fs.default.unlinkSync(filePath); // Pastikan file_url adalah path lengkap ke file
      })
    );
    console.log("Pengecekan dan penghapusan berhasil dilakukan.");
  } catch (error) {
    console.error("Gagal melakukan pengecekan dan penghapusan:", error);
  }
};
exports.autoDeleteProgram = autoDeleteProgram;

const renamePrograms = async (req, res) => {
  try {
    const { id, nama } = req.query;
    const old_program = await _ProgramModel.default.findByPk(id);

    if (!old_program) {
      return res.status(404).json({ error: "Program not found" });
    }
    if (!nama) {
      return res.status(400).json({ error: "Nama tidak boleh kosong" });
    }
    const existingFiles = await _ProgramModel.default.findAll({
      attributes: ["file_name"],
    });
    const fileExt = _path.default.extname(old_program.file_name).toLowerCase();
    const fileUrl = `file/programs/${nama}${fileExt}`;
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
    await _ProgramModel.default.update(
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
      old_program.file_url
    );
    const newFilePath = _path.default.join(__dirname, "..", "public", fileUrl);
    _fs.default.renameSync(oldFilePath, newFilePath);

    if (fileExt === ".pdf") {
      const qrCodeDataUrl = await QRCode.toDataURL(
        `https://api.simdoks.web.id/${fileUrl}`
      );

      const existingPdfBytes = _fs.default.readFileSync(newFilePath);
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
      _fs.default.writeFileSync(newFilePath, pdfBytes);
    }

    res.status(200).json("Program berhasil diupdate");
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};
exports.renamePrograms = renamePrograms;
