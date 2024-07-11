-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 22, 2024 at 08:21 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.0.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `simdoks`
--

-- --------------------------------------------------------

--
-- Table structure for table `accreditations`
--

CREATE TABLE `accreditations` (
  `id` int(11) NOT NULL,
  `categoriesId` int(11) NOT NULL,
  `typeId` int(11) NOT NULL,
  `subtypeId` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_url` varchar(255) NOT NULL,
  `start_date` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `accreditations`
--
DELIMITER $$
CREATE TRIGGER `after_delete_accreditation` AFTER DELETE ON `accreditations` FOR EACH ROW BEGIN
    UPDATE categories
    SET file_total = file_total - 1
    WHERE id = 1;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_delete_accreditations` AFTER DELETE ON `accreditations` FOR EACH ROW BEGIN
    INSERT INTO history (file_name, category_name, action, start_date, createdAt, deletion_system)
    VALUES (OLD.file_name, 'Akreditasi', 'Hapus', OLD.start_date, NOW(), 'Manual');
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_insert_accreditation` AFTER INSERT ON `accreditations` FOR EACH ROW BEGIN
    UPDATE categories
    SET file_total = file_total + 1
    WHERE id = 1;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_insert_accreditations` AFTER INSERT ON `accreditations` FOR EACH ROW BEGIN
    INSERT INTO history (file_name, category_name, action, start_date, createdAt)
    VALUES (NEW.file_name, 'Akreditasi', 'Tambah', NEW.start_date, NOW());
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_update_accreditations` AFTER UPDATE ON `accreditations` FOR EACH ROW BEGIN
    INSERT INTO history (file_name, category_name, action, start_date, createdAt)
    VALUES (NEW.file_name, 'Akreditasi', 'Edit', NEW.start_date, NOW());
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `accreditation_subtypes`
--

CREATE TABLE `accreditation_subtypes` (
  `id` int(11) NOT NULL,
  `typeId` int(11) NOT NULL,
  `subtype_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `accreditation_subtypes`
--

INSERT INTO `accreditation_subtypes` (`id`, `typeId`, `subtype_name`) VALUES
(1, 1, 'BAB 1.1'),
(2, 1, 'BAB 1.2'),
(3, 1, 'BAB 1.3'),
(4, 1, 'BAB 1.4'),
(5, 1, 'BAB 1.5'),
(6, 1, 'BAB 1.6'),
(7, 1, 'BAB 1.7'),
(8, 2, 'BAB 2.1'),
(9, 2, 'BAB 2.2'),
(10, 2, 'BAB 2.3'),
(11, 2, 'BAB 2.4'),
(12, 2, 'BAB 2.5'),
(13, 2, 'BAB 2.6'),
(14, 2, 'BAB 2.7'),
(15, 2, 'BAB 2.8'),
(16, 3, 'BAB 3.1'),
(17, 3, 'BAB 3.2'),
(18, 3, 'BAB 3.3'),
(19, 3, 'BAB 3.4'),
(20, 3, 'BAB 3.5'),
(21, 3, 'BAB 3.6'),
(22, 3, 'BAB 3.7'),
(23, 3, 'BAB 3.8'),
(24, 3, 'BAB 3.9'),
(25, 3, 'BAB 3.10'),
(26, 4, 'BAB 4.1'),
(27, 4, 'BAB 4.2'),
(28, 4, 'BAB 4.3'),
(29, 4, 'BAB 4.4'),
(30, 4, 'BAB 4.5'),
(31, 5, 'BAB 5.1'),
(32, 5, 'BAB 5.2'),
(33, 5, 'BAB 5.3'),
(34, 5, 'BAB 5.4'),
(35, 5, 'BAB 5.5');

-- --------------------------------------------------------

--
-- Table structure for table `accreditation_types`
--

CREATE TABLE `accreditation_types` (
  `id` int(11) NOT NULL,
  `categoriesId` int(11) NOT NULL,
  `type_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `accreditation_types`
--

INSERT INTO `accreditation_types` (`id`, `categoriesId`, `type_name`) VALUES
(1, 1, 'BAB 1'),
(2, 1, 'BAB 2'),
(3, 1, 'BAB 3'),
(4, 1, 'BAB 4'),
(5, 1, 'BAB 5');

-- --------------------------------------------------------

--
-- Table structure for table `archives`
--

CREATE TABLE `archives` (
  `id` int(11) NOT NULL,
  `categoriesId` int(11) NOT NULL,
  `typeId` int(11) NOT NULL,
  `subtypeId` int(11) DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_url` varchar(255) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `archives`
--
DELIMITER $$
CREATE TRIGGER `after_delete_archive` AFTER DELETE ON `archives` FOR EACH ROW BEGIN
    UPDATE categories
    SET file_total = file_total - 1
    WHERE id = 5;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_delete_archives` AFTER DELETE ON `archives` FOR EACH ROW BEGIN
    IF NOW() <= OLD.end_date THEN
        INSERT INTO history (file_name, category_name,  action, start_date, expired_date, createdAt, deletion_system)
        VALUES (OLD.file_name, 'Arsip', 'Hapus', OLD.start_date, OLD.end_date, NOW(), 'Manual');
    ELSE
        INSERT INTO history (file_name, category_name,  action, start_date, expired_date, createdAt, deletion_system)
        VALUES (OLD.file_name, 'Arsip', 'Hapus', OLD.start_date, OLD.end_date, NOW(), 'Automatis');
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_insert_archive` AFTER INSERT ON `archives` FOR EACH ROW BEGIN
    UPDATE categories
    SET file_total = file_total + 1
    WHERE id = 5;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_insert_archives` AFTER INSERT ON `archives` FOR EACH ROW BEGIN
    INSERT INTO history (file_name, category_name, action, start_date, expired_date, createdAt)
    VALUES (NEW.file_name, 'Arsip', 'Tambah', NEW.start_date, NEW.end_date, NOW());
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_update_archives` AFTER UPDATE ON `archives` FOR EACH ROW BEGIN
    INSERT INTO history (file_name, category_name, action, start_date, expired_date, createdAt)
    VALUES (NEW.file_name, 'Arsip', 'Edit', NEW.start_date, NEW.end_date, NOW());
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `archive_subtypes`
--

CREATE TABLE `archive_subtypes` (
  `id` int(11) NOT NULL,
  `typeId` int(11) NOT NULL,
  `subtype_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `archive_subtypes`
--

INSERT INTO `archive_subtypes` (`id`, `typeId`, `subtype_name`) VALUES
(1, 2, 'Surat Masuk'),
(2, 2, 'Surat Keluar');

-- --------------------------------------------------------

--
-- Table structure for table `archive_types`
--

CREATE TABLE `archive_types` (
  `id` int(11) NOT NULL,
  `categoriesId` int(11) NOT NULL,
  `type_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `archive_types`
--

INSERT INTO `archive_types` (`id`, `categoriesId`, `type_name`) VALUES
(1, 5, 'Arsip Statis'),
(2, 5, 'Arsip Dinamis');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `category_name` varchar(255) NOT NULL,
  `barcode_url` varchar(255) NOT NULL,
  `file_total` int(11) NOT NULL DEFAULT 0,
  `validity_period` int(11) DEFAULT NULL,
  `deletion_system` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `category_name`, `barcode_url`, `file_total`, `validity_period`, `deletion_system`, `createdAt`, `updatedAt`) VALUES
(1, 'Akreditasi', 'Akreditasi', 0, NULL, 'Manual', '2024-05-23 01:20:13', '2024-05-23 01:20:13'),
(2, 'Kepegawaian', 'Kepegawaian', 0, NULL, 'Manual', '2024-05-23 01:20:13', '2024-05-23 01:20:13'),
(3, 'Barang', 'Barang', 0, 5, 'Otomatis', '2024-05-23 01:20:13', '2024-05-23 01:20:13'),
(4, 'Program', 'Program', 0, 5, 'Otomatis', '2024-05-23 01:20:13', '2024-05-23 01:20:13'),
(5, 'Arsip', 'Arsip', 0, 5, 'Otomatis', '2024-05-23 01:20:13', '2024-05-23 01:20:13'),
(6, 'Keuangan', 'Keuangan', 0, 20, 'Otomatis', '2024-05-23 01:20:13', '2024-05-23 01:20:13'),
(7, 'Tugas', 'Tugas', 0, 5, 'Otomatis', '2024-05-23 01:20:13', '2024-05-23 01:20:13');

-- --------------------------------------------------------

--
-- Table structure for table `finances`
--

CREATE TABLE `finances` (
  `id` int(11) NOT NULL,
  `categoriesId` int(11) NOT NULL,
  `typeId` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_url` varchar(255) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `finances`
--
DELIMITER $$
CREATE TRIGGER `after_delete_finance` AFTER DELETE ON `finances` FOR EACH ROW BEGIN
    UPDATE categories
    SET file_total = file_total - 1
    WHERE id = 6;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_delete_finances` AFTER DELETE ON `finances` FOR EACH ROW BEGIN
    IF NOW() <= OLD.end_date THEN
        INSERT INTO history (file_name, category_name, action, start_date, expired_date, createdAt, deletion_system)
        VALUES (OLD.file_name, 'Keuangan', 'Hapus', OLD.start_date, OLD.end_date, NOW(), 'Manual');
    ELSE
        INSERT INTO history (file_name, category_name, action, start_date, expired_date, createdAt, deletion_system)
        VALUES (OLD.file_name, 'Keuangan', 'Hapus', OLD.start_date, OLD.end_date, NOW(), 'Automatis');
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_insert_finance` AFTER INSERT ON `finances` FOR EACH ROW BEGIN
    UPDATE categories
    SET file_total = file_total + 1
    WHERE id = 6;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_insert_finances` AFTER INSERT ON `finances` FOR EACH ROW BEGIN
    INSERT INTO history (file_name, category_name, action, start_date, expired_date, createdAt)
    VALUES (NEW.file_name, 'Keuangan', 'Tambah', NEW.start_date, NEW.end_date, NOW());
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_update_finances` AFTER UPDATE ON `finances` FOR EACH ROW BEGIN
    INSERT INTO history (file_name, category_name,  action, start_date, expired_date, createdAt)
    VALUES (NEW.file_name, 'Keuangan', 'Edit', NEW.start_date, NEW.end_date, NOW());
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `finance_types`
--

CREATE TABLE `finance_types` (
  `id` int(11) NOT NULL,
  `categoriesId` int(11) NOT NULL,
  `type_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `finance_types`
--

INSERT INTO `finance_types` (`id`, `categoriesId`, `type_name`) VALUES
(1, 6, 'Sumber Dana DAK'),
(2, 6, 'BLUD Penerima'),
(3, 6, 'BLUD Pengeluaran');

-- --------------------------------------------------------

--
-- Table structure for table `history`
--

CREATE TABLE `history` (
  `id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `category_name` varchar(255) NOT NULL,
  `action` varchar(255) NOT NULL,
  `start_date` datetime NOT NULL,
  `expired_date` datetime DEFAULT NULL,
  `deletion_system` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `categoriesId` int(11) NOT NULL,
  `typeId` int(11) NOT NULL,
  `subtypeId` int(11) DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_url` varchar(255) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `items`
--
DELIMITER $$
CREATE TRIGGER `after_delete_item` AFTER DELETE ON `items` FOR EACH ROW BEGIN
    UPDATE categories
    SET file_total = file_total - 1
    WHERE id = 3;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_delete_items` AFTER DELETE ON `items` FOR EACH ROW BEGIN
    IF NOW() <= OLD.end_date THEN
        INSERT INTO history (file_name, category_name, action, start_date, expired_date, createdAt, deletion_system)
        VALUES (OLD.file_name, 'Barang', 'Hapus', OLD.start_date, OLD.end_date, NOW(), 'Manual');
    ELSE
        INSERT INTO history (file_name, category_name, action, start_date, expired_date, createdAt, deletion_system)
        VALUES (OLD.file_name, 'Barang', 'Hapus', OLD.start_date, OLD.end_date, NOW(), 'Automatis');
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_insert_item` AFTER INSERT ON `items` FOR EACH ROW BEGIN
    UPDATE categories
    SET file_total = file_total + 1
    WHERE id = 3;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_insert_items` AFTER INSERT ON `items` FOR EACH ROW BEGIN
    INSERT INTO history (file_name, category_name, action, start_date, expired_date, createdAt)
    VALUES (NEW.file_name, 'Barang', 'Tambah', NEW.start_date, NEW.end_date, NOW());
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_update_items` AFTER UPDATE ON `items` FOR EACH ROW BEGIN
    INSERT INTO history (file_name, category_name, action, start_date, expired_date, createdAt)
    VALUES (NEW.file_name, 'Barang', 'Edit', NEW.start_date, NEW.end_date, NOW());
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `item_subtypes`
--

CREATE TABLE `item_subtypes` (
  `id` int(11) NOT NULL,
  `typeId` int(11) NOT NULL,
  `subtype_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `item_subtypes`
--

INSERT INTO `item_subtypes` (`id`, `typeId`, `subtype_name`) VALUES
(1, 1, 'Aset Tetap'),
(2, 1, 'Aset Tidak Tetap');

-- --------------------------------------------------------

--
-- Table structure for table `item_types`
--

CREATE TABLE `item_types` (
  `id` int(11) NOT NULL,
  `categoriesId` int(11) NOT NULL,
  `type_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `item_types`
--

INSERT INTO `item_types` (`id`, `categoriesId`, `type_name`) VALUES
(1, 3, 'Aset'),
(2, 3, 'Persediaan');

-- --------------------------------------------------------

--
-- Table structure for table `programs`
--

CREATE TABLE `programs` (
  `id` int(11) NOT NULL,
  `categoriesId` int(11) NOT NULL,
  `typeId` int(11) NOT NULL,
  `subtypeId` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_url` varchar(255) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `programs`
--
DELIMITER $$
CREATE TRIGGER `after_delete_program` AFTER DELETE ON `programs` FOR EACH ROW BEGIN
    UPDATE categories
    SET file_total = file_total - 1
    WHERE id = 4;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_delete_programs` AFTER DELETE ON `programs` FOR EACH ROW BEGIN
    IF NOW() <= OLD.end_date THEN
        INSERT INTO history (file_name, category_name, action, start_date, expired_date, createdAt, deletion_system)
        VALUES (OLD.file_name, 'Program', 'Hapus', OLD.start_date, OLD.end_date, NOW(), 'Manual');
    ELSE
        INSERT INTO history (file_name, category_name,  action, start_date, expired_date, createdAt, deletion_system)
        VALUES (OLD.file_name, 'Program', 'Hapus', OLD.start_date, OLD.end_date, NOW(), 'Automatis');
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_insert_program` AFTER INSERT ON `programs` FOR EACH ROW BEGIN
    UPDATE categories
    SET file_total = file_total + 1
    WHERE id = 4;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_insert_programs` AFTER INSERT ON `programs` FOR EACH ROW BEGIN
    INSERT INTO history (file_name, category_name, action, start_date, expired_date, createdAt)
    VALUES (NEW.file_name, 'Program', 'Tambah', NEW.start_date, NEW.end_date, NOW());
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_update_programs` AFTER UPDATE ON `programs` FOR EACH ROW BEGIN
    INSERT INTO history (file_name, category_name, action, start_date, expired_date, createdAt)
    VALUES (NEW.file_name, 'Program', 'Edit', NEW.start_date, NEW.end_date, NOW());
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `program_subtypes`
--

CREATE TABLE `program_subtypes` (
  `id` int(11) NOT NULL,
  `typeId` int(11) NOT NULL,
  `subtype_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `program_subtypes`
--

INSERT INTO `program_subtypes` (`id`, `typeId`, `subtype_name`) VALUES
(1, 1, 'Promosi Kesehatan'),
(2, 1, 'Kesehatan Lingkungan'),
(3, 1, 'Kesehatan Keluarga'),
(4, 1, 'Gizi'),
(5, 1, 'Pencegahan dan Pengendalian Penyakit'),
(6, 1, 'Pelayanan Keperawatan Kesehatan Masyarakat'),
(7, 2, 'Kesehatan Kerja dan Kesehatan Olahraga'),
(8, 2, 'Haji'),
(9, 2, 'Kesehatan Tradisional'),
(10, 2, 'Kesehatan Kerja dan Kesehatan Olahraga'),
(11, 2, 'Upaya Kesehatan Gigi Masyarakat'),
(12, 3, 'Rawat Jalan'),
(13, 3, 'Rawat Inap'),
(14, 3, 'Rekam Medis'),
(15, 3, 'Farmasi'),
(16, 3, 'Laboratorium');

-- --------------------------------------------------------

--
-- Table structure for table `program_types`
--

CREATE TABLE `program_types` (
  `id` int(11) NOT NULL,
  `categoriesId` int(11) NOT NULL,
  `type_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `program_types`
--

INSERT INTO `program_types` (`id`, `categoriesId`, `type_name`) VALUES
(1, 4, 'Esensial'),
(2, 4, 'Upaya Kesehatan Pengembangan'),
(3, 4, 'Upaya Kesehatan Perorangan');

-- --------------------------------------------------------

--
-- Table structure for table `staffs`
--

CREATE TABLE `staffs` (
  `id` int(11) NOT NULL,
  `categoriesId` int(11) NOT NULL,
  `typeId` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_url` varchar(255) NOT NULL,
  `start_date` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `staffs`
--
DELIMITER $$
CREATE TRIGGER `after_delete_staff` AFTER DELETE ON `staffs` FOR EACH ROW BEGIN
    UPDATE categories
    SET file_total = file_total - 1
    WHERE id = 2;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_delete_staffs` AFTER DELETE ON `staffs` FOR EACH ROW BEGIN
    INSERT INTO history (file_name, category_name,  action, start_date, createdAt, deletion_system)
    VALUES (OLD.file_name, 'Kepegawaian', 'Hapus', OLD.start_date, NOW(), 'Manual');
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_insert_staff` AFTER INSERT ON `staffs` FOR EACH ROW BEGIN
    UPDATE categories
    SET file_total = file_total + 1
    WHERE id = 2;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_insert_staffs` AFTER INSERT ON `staffs` FOR EACH ROW BEGIN
    INSERT INTO history (file_name, category_name, action, start_date, createdAt)
    VALUES (NEW.file_name, 'Kepegawaian', 'Tambah', NEW.start_date, NOW());
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_update_staffs` AFTER UPDATE ON `staffs` FOR EACH ROW BEGIN
    INSERT INTO history (file_name, category_name,  action, start_date, createdAt)
    VALUES (NEW.file_name, 'Kepegawaian', 'Edit', NEW.start_date, NOW());
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `staff_types`
--

CREATE TABLE `staff_types` (
  `id` int(11) NOT NULL,
  `categoriesId` int(11) NOT NULL,
  `type_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `staff_types`
--

INSERT INTO `staff_types` (`id`, `categoriesId`, `type_name`) VALUES
(1, 2, 'Pimpinan'),
(2, 2, 'Dokter'),
(3, 2, 'Perawat'),
(4, 2, 'Bidan'),
(5, 2, 'Paramedis'),
(6, 2, 'Administrasi'),
(7, 2, 'Non Medis');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `categoriesId` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_url` varchar(255) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `tasks`
--
DELIMITER $$
CREATE TRIGGER `after_delete_task` AFTER DELETE ON `tasks` FOR EACH ROW BEGIN
    UPDATE categories
    SET file_total = file_total - 1
    WHERE id = 7;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_delete_tasks` AFTER DELETE ON `tasks` FOR EACH ROW BEGIN
    IF NOW() <= OLD.end_date THEN
        INSERT INTO history (file_name, category_name, action, start_date, expired_date, createdAt, deletion_system)
        VALUES (OLD.file_name, 'Tugas', 'Hapus', OLD.start_date, OLD.end_date, NOW(), 'Manual');
    ELSE
        INSERT INTO history (file_name, category_name,  action, start_date, expired_date, createdAt, deletion_system)
        VALUES (OLD.file_name, 'Tugas', 'Hapus', OLD.start_date, OLD.end_date, NOW(), 'Automatis');
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_insert_task` AFTER INSERT ON `tasks` FOR EACH ROW BEGIN
    UPDATE categories
    SET file_total = file_total + 1
    WHERE id = 7;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_insert_tasks` AFTER INSERT ON `tasks` FOR EACH ROW BEGIN
    INSERT INTO history (file_name, category_name,  action, start_date, expired_date, createdAt)
    VALUES (NEW.file_name, 'Tugas', 'Tambah', NEW.start_date, NEW.end_date, NOW());
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_update_tasks` AFTER UPDATE ON `tasks` FOR EACH ROW BEGIN
    INSERT INTO history (file_name, category_name, action, start_date, expired_date, createdAt)
    VALUES (NEW.file_name, 'Tugas', 'Edit', NEW.start_date, NEW.end_date, NOW());
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `refresh_token` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `refresh_token`, `createdAt`, `updatedAt`) VALUES
(1, 'leader', '$2b$10$yuOzcsaxwi0/0EiSWwx7oexIYCH.HFYyBl59E5VNZ2wv11.wXYzd2', 'leader', NULL, '2024-05-23 01:20:13', '2024-05-23 01:20:13'),
(2, 'akreditasi', '$2b$10$yuOzcsaxwi0/0EiSWwx7oeZXGoQKatgRzYfIlM7kBFPg/XdpjeJGC', 'staff akreditasi', NULL, '2024-05-23 01:20:13', '2024-05-23 01:20:13'),
(3, 'barang', '$2b$10$yuOzcsaxwi0/0EiSWwx7oeulU2A953aiZrZlzga39EG/tNy7Qsgye', 'staff barang', NULL, '2024-05-23 01:20:13', '2024-05-23 01:20:13'),
(4, 'kepegawaian', '$2b$10$yuOzcsaxwi0/0EiSWwx7oeX7PUt0HydH6VslHJdazdTGElXxLo1LS', 'staff kepegawaian', NULL, '2024-05-23 01:20:13', '2024-05-23 01:20:13'),
(5, 'program', '$2b$10$yuOzcsaxwi0/0EiSWwx7oerBmn/Qg2UEoQHCL22ZFyqwB.xUUPf/a', 'staff program', NULL, '2024-05-23 01:20:13', '2024-05-23 01:20:13'),
(6, 'surat', '$2b$10$yuOzcsaxwi0/0EiSWwx7oeQ.p8/msNNEGLJzBr9lGyHj3BlJc2Que', 'staff surat', NULL, '2024-05-23 01:20:13', '2024-05-23 01:20:13'),
(7, 'keuangan', '$2b$10$yuOzcsaxwi0/0EiSWwx7oe6iDESQCnGvRZiu1rqFv5L6Lro0Dkb62', 'staff keuangan', NULL, '2024-05-23 01:20:13', '2024-05-23 01:20:13'),
(8, 'tugas', '$2b$10$yuOzcsaxwi0/0EiSWwx7oe.9MFkE9FFrZOz1keCq1kQPWHiuuxIk2', 'staff tugas', NULL, '2024-05-23 01:20:13', '2024-05-23 01:20:13');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accreditations`
--
ALTER TABLE `accreditations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `file_name` (`file_name`),
  ADD KEY `categoriesId` (`categoriesId`),
  ADD KEY `typeId` (`typeId`),
  ADD KEY `subtypeId` (`subtypeId`);

--
-- Indexes for table `accreditation_subtypes`
--
ALTER TABLE `accreditation_subtypes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `typeId` (`typeId`);

--
-- Indexes for table `accreditation_types`
--
ALTER TABLE `accreditation_types`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoriesId` (`categoriesId`);

--
-- Indexes for table `archives`
--
ALTER TABLE `archives`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `file_name` (`file_name`),
  ADD KEY `categoriesId` (`categoriesId`),
  ADD KEY `typeId` (`typeId`),
  ADD KEY `subtypeId` (`subtypeId`);

--
-- Indexes for table `archive_subtypes`
--
ALTER TABLE `archive_subtypes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `typeId` (`typeId`);

--
-- Indexes for table `archive_types`
--
ALTER TABLE `archive_types`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoriesId` (`categoriesId`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `finances`
--
ALTER TABLE `finances`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `file_name` (`file_name`),
  ADD KEY `categoriesId` (`categoriesId`),
  ADD KEY `typeId` (`typeId`);

--
-- Indexes for table `finance_types`
--
ALTER TABLE `finance_types`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoriesId` (`categoriesId`);

--
-- Indexes for table `history`
--
ALTER TABLE `history`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `file_name` (`file_name`),
  ADD KEY `categoriesId` (`categoriesId`),
  ADD KEY `typeId` (`typeId`),
  ADD KEY `subtypeId` (`subtypeId`);

--
-- Indexes for table `item_subtypes`
--
ALTER TABLE `item_subtypes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `typeId` (`typeId`);

--
-- Indexes for table `item_types`
--
ALTER TABLE `item_types`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoriesId` (`categoriesId`);

--
-- Indexes for table `programs`
--
ALTER TABLE `programs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `file_name` (`file_name`),
  ADD KEY `categoriesId` (`categoriesId`),
  ADD KEY `typeId` (`typeId`),
  ADD KEY `subtypeId` (`subtypeId`);

--
-- Indexes for table `program_subtypes`
--
ALTER TABLE `program_subtypes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `typeId` (`typeId`);

--
-- Indexes for table `program_types`
--
ALTER TABLE `program_types`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoriesId` (`categoriesId`);

--
-- Indexes for table `staffs`
--
ALTER TABLE `staffs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `file_name` (`file_name`),
  ADD KEY `categoriesId` (`categoriesId`),
  ADD KEY `typeId` (`typeId`);

--
-- Indexes for table `staff_types`
--
ALTER TABLE `staff_types`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoriesId` (`categoriesId`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoriesId` (`categoriesId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accreditations`
--
ALTER TABLE `accreditations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `accreditation_subtypes`
--
ALTER TABLE `accreditation_subtypes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `accreditation_types`
--
ALTER TABLE `accreditation_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `archives`
--
ALTER TABLE `archives`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `archive_subtypes`
--
ALTER TABLE `archive_subtypes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `archive_types`
--
ALTER TABLE `archive_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `finances`
--
ALTER TABLE `finances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `finance_types`
--
ALTER TABLE `finance_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `history`
--
ALTER TABLE `history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `item_subtypes`
--
ALTER TABLE `item_subtypes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `item_types`
--
ALTER TABLE `item_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `programs`
--
ALTER TABLE `programs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `program_subtypes`
--
ALTER TABLE `program_subtypes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `program_types`
--
ALTER TABLE `program_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `staffs`
--
ALTER TABLE `staffs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff_types`
--
ALTER TABLE `staff_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `accreditations`
--
ALTER TABLE `accreditations`
  ADD CONSTRAINT `accreditations_ibfk_1` FOREIGN KEY (`categoriesId`) REFERENCES `categories` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `accreditations_ibfk_2` FOREIGN KEY (`typeId`) REFERENCES `accreditation_types` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `accreditations_ibfk_3` FOREIGN KEY (`subtypeId`) REFERENCES `accreditation_subtypes` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `accreditation_subtypes`
--
ALTER TABLE `accreditation_subtypes`
  ADD CONSTRAINT `accreditation_subtypes_ibfk_1` FOREIGN KEY (`typeId`) REFERENCES `accreditation_types` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `accreditation_types`
--
ALTER TABLE `accreditation_types`
  ADD CONSTRAINT `accreditation_types_ibfk_1` FOREIGN KEY (`categoriesId`) REFERENCES `categories` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `archives`
--
ALTER TABLE `archives`
  ADD CONSTRAINT `archives_ibfk_1` FOREIGN KEY (`categoriesId`) REFERENCES `categories` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `archives_ibfk_2` FOREIGN KEY (`typeId`) REFERENCES `archive_types` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `archives_ibfk_3` FOREIGN KEY (`subtypeId`) REFERENCES `archive_subtypes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `archive_subtypes`
--
ALTER TABLE `archive_subtypes`
  ADD CONSTRAINT `archive_subtypes_ibfk_1` FOREIGN KEY (`typeId`) REFERENCES `archive_types` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `archive_types`
--
ALTER TABLE `archive_types`
  ADD CONSTRAINT `archive_types_ibfk_1` FOREIGN KEY (`categoriesId`) REFERENCES `categories` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `finances`
--
ALTER TABLE `finances`
  ADD CONSTRAINT `finances_ibfk_1` FOREIGN KEY (`categoriesId`) REFERENCES `categories` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `finances_ibfk_2` FOREIGN KEY (`typeId`) REFERENCES `finance_types` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `finance_types`
--
ALTER TABLE `finance_types`
  ADD CONSTRAINT `finance_types_ibfk_1` FOREIGN KEY (`categoriesId`) REFERENCES `categories` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `items_ibfk_1` FOREIGN KEY (`categoriesId`) REFERENCES `categories` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `items_ibfk_2` FOREIGN KEY (`typeId`) REFERENCES `item_types` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `items_ibfk_3` FOREIGN KEY (`subtypeId`) REFERENCES `item_subtypes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `item_subtypes`
--
ALTER TABLE `item_subtypes`
  ADD CONSTRAINT `item_subtypes_ibfk_1` FOREIGN KEY (`typeId`) REFERENCES `item_types` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `item_types`
--
ALTER TABLE `item_types`
  ADD CONSTRAINT `item_types_ibfk_1` FOREIGN KEY (`categoriesId`) REFERENCES `categories` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `programs`
--
ALTER TABLE `programs`
  ADD CONSTRAINT `programs_ibfk_1` FOREIGN KEY (`categoriesId`) REFERENCES `categories` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `programs_ibfk_2` FOREIGN KEY (`typeId`) REFERENCES `program_types` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `programs_ibfk_3` FOREIGN KEY (`subtypeId`) REFERENCES `program_subtypes` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `program_subtypes`
--
ALTER TABLE `program_subtypes`
  ADD CONSTRAINT `program_subtypes_ibfk_1` FOREIGN KEY (`typeId`) REFERENCES `program_types` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `program_types`
--
ALTER TABLE `program_types`
  ADD CONSTRAINT `program_types_ibfk_1` FOREIGN KEY (`categoriesId`) REFERENCES `categories` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `staffs`
--
ALTER TABLE `staffs`
  ADD CONSTRAINT `staffs_ibfk_1` FOREIGN KEY (`categoriesId`) REFERENCES `categories` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `staffs_ibfk_2` FOREIGN KEY (`typeId`) REFERENCES `staff_types` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `staff_types`
--
ALTER TABLE `staff_types`
  ADD CONSTRAINT `staff_types_ibfk_1` FOREIGN KEY (`categoriesId`) REFERENCES `categories` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`categoriesId`) REFERENCES `categories` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
