"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.updateStaff =
  exports.searchStaff =
  exports.getStaffs =
  exports.getStaffById =
  exports.filterByYears =
  exports.deleteStaff =
  exports.createStaff =
    void 0;
require("core-js/modules/es.parse-int.js");
require("core-js/modules/es.promise.js");
require("core-js/modules/es.regexp.exec.js");
require("core-js/modules/es.string.search.js");
var _StaffModel = _interopRequireDefault(require("../models/StaffModel.js"));
var _path = _interopRequireDefault(require("path"));
var _fs = _interopRequireDefault(require("fs"));
var _sequelize = require("sequelize");
var { PDFDocument, rgb } = require("pdf-lib");
var QRCode = require("qrcode");
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
const getStaffs = async (req, res) => {
  try {
    const staffs = await _StaffModel.default.findAll();
    res.status(200).json(staffs);
  } catch (error) {
    console.log(error.message);
  }
};
exports.getStaffs = getStaffs;
const getStaffById = async (req, res) => {
  try {
    const staff = await _StaffModel.default.findByPk(req.params.id);
    res.status(200).json(staff);
  } catch (error) {
    console.log(error.message);
  }
};
exports.getStaffById = getStaffById;
const createStaff = async (req, res) => {
  try {
    const { nama, startDate, typeId } = req.body;
    const file = req.files.file;
    if (nama === "" || startDate === "" || typeId === "") {
      return res.status(400).json("Semua field harus diisi");
    }
    const existingFiles = await _StaffModel.default.findAll({
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
    const fileUrl = "file/staffs/".concat(nama).concat(fileExt);
    await _StaffModel.default.create({
      categoriesId: 2,
      typeId: typeId,
      file_name: nama + fileExt,
      file_url: fileUrl,
      start_date: startDate,
    });
    await file.mv("./public/file/staffs/".concat(nama).concat(fileExt));
    if (fileExt === ".pdf") {
      const qrCodeDataUrl = await QRCode.toDataURL(
        `https://api.simdoks.web.id/${fileUrl}`
      );

      const existingPdfBytes = _fs.default.readFileSync(
        `./public/file/staffs/${nama}${fileExt}`
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
        `./public/file/staffs/${nama}${fileExt}`,
        pdfBytes
      );
    }
    res.status(201).json("Staff berhasil ditambahkan");
  } catch (error) {
    console.log(error.message);
  }
};
exports.createStaff = createStaff;
const updateStaff = async (req, res) => {
  try {
    const { nama, startDate, typeId } = req.body;
    const file = req.files.file;
    if (nama === "" || startDate === "" || typeId === "") {
      return res.status(400).json("Semua field harus diisi");
    }
    const existingFiles = await _StaffModel.default.findAll({
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
    const fileUrl = "file/staffs/".concat(nama).concat(fileExt);
    const previousStaffs = await _StaffModel.default.findByPk(
      req.params.id
    );
    if (previousStaffs) {
      const previousFileUrl = "./public/".concat(previousStaffs.file_url);
      if (_fs.default.existsSync(previousFileUrl)) {
        _fs.default.unlinkSync(previousFileUrl);
      }
    }
    await _StaffModel.default.update(
      {
        categoriesId: 2,
        typeId: typeId,
        file_name: nama + fileExt,
        file_url: fileUrl,
        start_date: startDate,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    await file.mv("./public/file/staffs/".concat(nama).concat(fileExt));
    if (fileExt === ".pdf") {
      const qrCodeDataUrl = await QRCode.toDataURL(
        `https://api.simdoks.web.id/${fileUrl}`
      );

      const existingPdfBytes = _fs.default.readFileSync(
        `./public/file/staffs/${nama}${fileExt}`
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
        `./public/file/staffs/${nama}${fileExt}`,
        pdfBytes
      );
    }
    res.status(200).json("Staff berhasil diupdate");
  } catch (error) {
    console.log(error.message);
  }
};
exports.updateStaff = updateStaff;
const deleteStaff = async (req, res) => {
  try {
    const staffs = await _StaffModel.default.findByPk(req.params.id);
    const filePath = _path.default.join(
      process.cwd(),
      "public/".concat(staffs.file_url)
    );
    _fs.default.unlink(filePath, async () => {
      await _StaffModel.default.destroy({
        where: {
          id: req.params.id,
        },
      });
      res.status(200).json("Staff berhasil dihapus");
    });
  } catch (error) {
    console.log(error.message);
  }
};
exports.deleteStaff = deleteStaff;
const searchStaff = async (req, res) => {
  try {
    const staff = await _StaffModel.default.findAll({
      where: {
        typeId: req.query.typeId,
        file_name: {
          [_sequelize.Op.like]: "%".concat(req.query.search, "%"),
        },
      },
    });
    res.status(200).json(staff);
  } catch (error) {
    console.log(error.message);
  }
};
exports.searchStaff = searchStaff;
const filterByYears = async (req, res) => {
  try {
    const { typeId, years } = req.query;
    const startDate = "".concat(years, "-01-01");
    const endDate = "".concat(parseInt(years) + 1, "-01-01");
    const staff = await _StaffModel.default.findAll({
      where: {
        typeId: typeId,
        start_date: {
          [_sequelize.Op.between]: [startDate, endDate],
        },
      },
    });
    res.status(200).json(staff);
  } catch (error) {
    console.log(error.message);
  }
};
exports.filterByYears = filterByYears;

const renameStaffs = async (req, res) => {
  try {
    const { id, nama } = req.query;
    const old_staff = await _StaffModel.default.findByPk(id);

    if (!old_staff) {
      return res.status(404).json({ error: "Staff not found" });
    }
    if (!nama) {
      return res.status(400).json({ error: "Nama tidak boleh kosong" });
    }
    const existingFiles = await _StaffModel.default.findAll({
      attributes: ["file_name"],
    });
    const fileExt = _path.default.extname(old_staff.file_name).toLowerCase();
    const fileUrl = `file/staffs/${nama}${fileExt}`;
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
    await _StaffModel.default.update(
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
      old_staff.file_url
    );
    const newFilePath = _path.default.join(__dirname, "..", "public", fileUrl);
    _fs.default.renameSync(oldFilePath, newFilePath);
    if (fileExt === ".pdf") {
      const qrCodeDataUrl = await QRCode.toDataURL(
        `https://api.simdoks.web.id/${fileUrl}`
      );

      const existingPdfBytes = _fs.default.readFileSync(
        `./public/file/staffs/${nama}${fileExt}`
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
        `./public/file/staffs/${nama}${fileExt}`,
        pdfBytes
      );
    }

    res.status(200).json("Staff berhasil diupdate");
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};
exports.renameStaffs = renameStaffs;
