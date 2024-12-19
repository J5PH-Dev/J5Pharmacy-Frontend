-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Dec 19, 2024 at 03:16 AM
-- Server version: 10.11.10-MariaDB
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u280565526_j5pharmacy`
--

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `branch_id` int(11) NOT NULL,
  `branch_code` varchar(255) NOT NULL,
  `branch_name` varchar(100) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `branch_manager` varchar(100) DEFAULT NULL,
  `contact_number` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `branches`
--

INSERT INTO `branches` (`branch_id`, `branch_code`, `branch_name`, `location`, `branch_manager`, `contact_number`, `email`, `created_at`, `updated_at`) VALUES
(1, 'ABC123', 'Bagong Silang, Caloocan City', 'Ph. 10-A Pkg. 2, Caloocan, Metro Manila', NULL, NULL, NULL, '2024-12-10 07:03:20', '2024-12-18 21:29:08'),
(2, 'CBA123', 'Isla Talipapa, Bulacan', 'ISLA TALIPAPA, 588 Asuncion Diaz Abella Rd, San Jose del Monte City, 3023 Bulacan', NULL, NULL, NULL, '2024-12-10 07:03:20', '2024-12-18 21:29:25'),
(3, 'EFG123', 'Kaypian, Bulacan', 'R379+7GW, Kaypian Rd, San Jose del Monte City, 3023 Bulacan', NULL, NULL, NULL, '2024-12-10 07:03:20', '2024-12-18 21:29:36');

-- --------------------------------------------------------

--
-- Table structure for table `branch_inventory`
--

CREATE TABLE `branch_inventory` (
  `id` int(11) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cash_reconciliation`
--

CREATE TABLE `cash_reconciliation` (
  `reconciliation_id` int(11) NOT NULL,
  `pharmacist_session_id` int(11) NOT NULL,
  `total_transactions` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `cash_counted` decimal(10,2) NOT NULL,
  `balance` decimal(10,2) NOT NULL,
  `denomination_1000` int(11) DEFAULT 0,
  `denomination_500` int(11) DEFAULT 0,
  `denomination_200` int(11) DEFAULT 0,
  `denomination_100` int(11) DEFAULT 0,
  `denomination_50` int(11) DEFAULT 0,
  `denomination_20` int(11) DEFAULT 0,
  `denomination_10` int(11) DEFAULT 0,
  `denomination_5` int(11) DEFAULT 0,
  `denomination_1` int(11) DEFAULT 0,
  `denomination_cents` int(11) DEFAULT 0,
  `status` enum('balanced','shortage','overage') NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `category_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `prefix` varchar(3) NOT NULL COMMENT 'BARCODE PREFIX CAN ONLY HOLD 3 CHARS'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`category_id`, `name`, `prefix`) VALUES
(1, 'BRANDED', 'BRA'),
(2, 'GENERIC', 'GEN'),
(3, 'COSMETICS', 'COS'),
(4, 'DIAPER', 'DIA'),
(5, 'FACE AND BODY', 'FAB'),
(6, 'GALENICALS', 'GAL'),
(7, 'MILK', 'MIL'),
(8, 'PILLS AND CONTRACEPTIVES', 'PAC'),
(9, 'SYRUP', 'SYR'),
(10, 'OTHERS', 'OTH'),
(22, 'd', '');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `customer_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `discount_type` enum('None','Senior','PWD','Employee') DEFAULT 'None',
  `discount_id_number` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`customer_id`, `name`, `phone`, `email`, `address`, `discount_type`, `discount_id_number`, `created_at`, `updated_at`) VALUES
(1, 'Juan Dela Cruz', '09123456789', 'juan@email.com', 'Manila City', 'Senior', '123456', '2024-12-02 22:09:35', '2024-12-11 06:50:51'),
(2, 'Maria Santos', '', '', 'Quezon City', 'PWD', '789012', '2024-12-05 23:03:07', '2024-12-11 06:51:11');

-- --------------------------------------------------------

--
-- Table structure for table `pharmacist`
--

CREATE TABLE `pharmacist` (
  `staff_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(100) NOT NULL,
  `pin_code` char(4) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pharmacist`
--

INSERT INTO `pharmacist` (`staff_id`, `name`, `email`, `phone`, `pin_code`, `branch_id`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Kevin Llanes', '', '', '2704', 1, 1, '2024-12-10 07:03:20', '2024-12-15 17:48:42'),
(2, 'Karl Matthew Miranda', '', '', '5678', 1, 1, '2024-12-10 07:03:20', '2024-12-15 17:49:23'),
(3, 'Joshua Lonoza', '', '', '9012', 2, 1, '2024-12-10 07:03:20', '2024-12-18 23:08:19'),
(4, 'James Ivan Camique', '', '', '3456', 3, 1, '2024-12-10 07:03:20', '2024-12-18 23:08:25'),
(5, 'Janeth Escala', '', '', '1001', 2, 0, '2024-12-15 11:03:04', '2024-12-15 16:21:16');

-- --------------------------------------------------------

--
-- Table structure for table `pharmacist_sessions`
--

CREATE TABLE `pharmacist_sessions` (
  `pharmacist_session_id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `share_percentage` decimal(5,2) DEFAULT 100.00,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pharmacist_sessions`
--

INSERT INTO `pharmacist_sessions` (`pharmacist_session_id`, `session_id`, `staff_id`, `share_percentage`, `created_at`) VALUES
(3, 1, 1, 100.00, '2024-12-18 22:30:15'),
(4, 2, 1, 100.00, '2024-12-18 22:30:45'),
(5, 3, 2, 100.00, '2024-12-18 22:34:40'),
(6, 4, 1, 100.00, '2024-12-18 22:35:11'),
(7, 5, 1, 100.00, '2024-12-18 22:38:56'),
(8, 6, 1, 100.00, '2024-12-18 22:39:27'),
(9, 7, 1, 100.00, '2024-12-18 22:42:15'),
(10, 8, 1, 100.00, '2024-12-18 22:42:55'),
(11, 9, 1, 100.00, '2024-12-18 22:45:08'),
(12, 10, 1, 100.00, '2024-12-18 22:46:02'),
(13, 11, 1, 100.00, '2024-12-18 22:50:35'),
(14, 12, 1, 100.00, '2024-12-18 22:55:51'),
(15, 13, 1, 100.00, '2024-12-18 23:00:01'),
(16, 14, 4, 100.00, '2024-12-18 23:08:34'),
(17, 15, 1, 100.00, '2024-12-18 23:23:56'),
(18, 16, 1, 100.00, '2024-12-19 00:10:10'),
(19, 17, 2, 100.00, '2024-12-19 00:18:31'),
(20, 18, 1, 100.00, '2024-12-19 00:22:19'),
(21, 19, 3, 100.00, '2024-12-19 00:27:33'),
(22, 20, 1, 100.00, '2024-12-19 00:47:46'),
(23, 21, 1, 100.00, NULL),
(24, 22, 1, 100.00, '2024-12-19 09:05:45'),
(25, 23, 1, 100.00, '2024-12-19 09:14:13'),
(26, 24, 1, 100.00, '2024-12-19 09:40:51'),
(27, 25, 1, 100.00, '2024-12-19 10:04:42'),
(28, 26, 1, 100.00, '2024-12-19 10:09:03'),
(29, 27, 1, 100.00, '2024-12-19 10:12:52'),
(30, 28, 1, 100.00, '2024-12-19 10:17:15'),
(31, 29, 4, 100.00, '2024-12-19 10:20:33'),
(32, 30, 4, 100.00, '2024-12-19 10:23:29'),
(33, 31, 1, 100.00, '2024-12-19 10:28:13'),
(34, 32, 1, 100.00, '2024-12-19 10:40:40');

-- --------------------------------------------------------

--
-- Table structure for table `prescriptions`
--

CREATE TABLE `prescriptions` (
  `prescription_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `doctor_name` varchar(100) NOT NULL,
  `doctor_license_number` varchar(50) DEFAULT NULL,
  `prescription_date` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `image_data` mediumblob DEFAULT NULL,
  `image_type` enum('JPEG','PNG','PDF') DEFAULT 'JPEG',
  `image_upload_date` timestamp NULL DEFAULT NULL,
  `status` enum('ACTIVE','USED','EXPIRED') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `prescriptions`
--

INSERT INTO `prescriptions` (`prescription_id`, `customer_id`, `doctor_name`, `doctor_license_number`, `prescription_date`, `expiry_date`, `notes`, `image_data`, `image_type`, `image_upload_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'Dr. Jose Rizal', 'MD-12345', '2024-01-15', '2024-02-15', 'Take with meals', 0x2f707265736372697074696f6e732f323032342f30312f72785f3030312e6a7067, 'JPEG', '2024-01-15 02:30:00', 'ACTIVE', '2024-12-10 07:03:21', '2024-12-10 07:03:21'),
(2, 2, 'Dr. Maria Makiling', 'MD-67890', '2024-01-10', '2024-02-10', 'Take twice daily', 0x2f707265736372697074696f6e732f323032342f30312f72785f3030322e706466, 'PDF', '2024-01-10 06:45:00', 'ACTIVE', '2024-12-10 07:03:21', '2024-12-10 07:03:21');

-- --------------------------------------------------------

--
-- Table structure for table `prescription_items`
--

CREATE TABLE `prescription_items` (
  `item_id` int(11) NOT NULL,
  `prescription_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `prescribed_quantity` int(11) NOT NULL,
  `dispensed_quantity` int(11) DEFAULT 0,
  `dosage_instructions` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `brand_name` varchar(255) NOT NULL,
  `category` int(11) NOT NULL DEFAULT 1,
  `description` text DEFAULT NULL,
  `sideEffects` text DEFAULT NULL,
  `dosage_amount` decimal(10,2) DEFAULT NULL,
  `dosage_unit` enum('mg','mcg','inch','tips','x','m','l','s','mg/ml','ml','g','tablet') DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `pieces_per_box` int(11) NOT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `requiresPrescription` tinyint(1) NOT NULL,
  `expiryDate` datetime DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT NULL,
  `updatedAt` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `brand_name`, `category`, `description`, `sideEffects`, `dosage_amount`, `dosage_unit`, `price`, `stock`, `pieces_per_box`, `barcode`, `requiresPrescription`, `expiryDate`, `createdAt`, `updatedAt`) VALUES
(2, 'DIOSMIN HESPERIDIN', 'NORMANAL', 1, 'Potential side effects may include mild gastrointestinal discomfort such as bloating, nausea, or upset stomach. Some users may experience dizziness, headache, or skin rashes. In rare cases, more serious reactions like difficulty breathing, swelling of the face, or anaphylaxis may occur. If you experience any of these symptoms, seek medical attention immediately. Always report any unusual or persistent symptoms to your healthcare provider', 'Potential side effects may include mild gastrointestinal discomfort such as bloating, nausea, or upset stomach. Some users may experience dizziness, headache, or skin rashes. In rare cases, more serious reactions like difficulty breathing, swelling of the face, or anaphylaxis may occur. If you experience any of these symptoms, seek medical attention immediately. Always report any unusual or persistent symptoms to your healthcare provider.', 0.00, 'mg', 50.00, 60, 0, '4806508329355', 1, '2026-05-27 00:00:00', '2024-12-16 05:08:52', '2024-12-18 19:27:06'),
(3, 'NAPROXEN', 'PROXEN', 1, NULL, NULL, 550.00, 'mg', 50.00, 250, 0, '4806520352881', 1, '2025-08-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(4, 'PREGABALIN', 'PROBAL 75', 1, NULL, NULL, NULL, NULL, 50.00, 100, 0, '4806525174716', 1, '2027-02-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(5, 'KETOANALOGUE', 'KETOREX', 1, NULL, NULL, NULL, NULL, 50.00, 200, 0, '4806524149630', 1, '2026-04-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(6, 'SAMBONG', 'AWANAY', 1, NULL, NULL, NULL, NULL, 50.00, 90, 0, '4806527191285', 0, '2026-04-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(7, 'PARACETAMOL + TRAMADOL', 'DOLSAPH', 1, NULL, NULL, NULL, NULL, 50.00, 200, 0, 'GEN-00001', 1, NULL, '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(8, 'MEFENAMIC ACID', 'ANALMIN', 1, NULL, NULL, 250.00, 'mg', 50.00, 300, 0, '4806519380086', 0, '2026-02-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(9, 'B. CLAUSII', 'NOVAFLORA', 1, NULL, NULL, NULL, NULL, 50.00, 70, 0, '8904181519387', 0, '2027-02-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(10, 'PREDNISONE', 'CORT', 1, NULL, NULL, 20.00, 'mg', 50.00, 200, 0, '4806529490058', 1, '2026-10-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(11, 'SALBUTAMOL', 'VENTOMAX', 1, NULL, NULL, 4.00, 'mg', 50.00, 100, 0, '4806520350917', 1, '2027-03-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(12, 'TELMISARTAN + HCL', 'TELSITAN-H', 1, NULL, NULL, NULL, NULL, 50.00, 100, 0, 'GEN-00002', 1, '2025-12-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(13, 'CITICOLINE', 'ZYNERVA', 1, NULL, NULL, 1.00, 'g', 50.00, 30, 0, '4806505290955', 1, '2026-02-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(14, 'DICLOFENA', 'FENCID', 1, NULL, NULL, 50.00, 'mg', 50.00, 100, 0, '4806527650584', 1, '2025-06-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(15, 'CLOPIDOGREL', 'COPIDE', 1, NULL, NULL, NULL, NULL, 50.00, 100, 0, '4806524149791', 1, '2025-11-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(16, 'LOPERAMIDE', 'SCHEELE', 1, NULL, NULL, NULL, NULL, 50.00, 100, 0, '4800338471796', 0, '2028-08-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(17, 'CARVEDILOL', 'KARVIDOL', 1, NULL, NULL, 6.25, 'mg', 50.00, 100, 0, '4806505140717', 1, '2026-12-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(18, 'MORINGA CAPS', '', 1, NULL, NULL, NULL, NULL, 50.00, 100, 0, '4806524143201', 0, '2025-09-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(19, 'SAMBONG', 'MIA FORTE', 1, NULL, NULL, NULL, NULL, 50.00, 100, 0, '4806503124566', 0, '2027-06-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(20, 'SIMVASTATIN', 'SIMVASYN', 1, NULL, NULL, 20.00, 'mg', 50.00, 200, 0, '4806037100760', 1, '2025-11-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(21, 'FEBUXOSTAT', 'FEBUDAY 40', 1, NULL, NULL, 40.00, 'mg', 50.00, 90, 0, '8904159620923', 1, '2027-01-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(22, 'IRBESARTAN', 'IRBEQ', 1, NULL, NULL, 300.00, 'mg', 50.00, 100, 0, '430037100012', 1, '2025-10-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(23, 'FUROSEMIDE', 'FUSEDEX', 1, NULL, NULL, 40.00, 'mg', 50.00, 200, 0, '4806520351105', 1, '2025-04-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(24, 'PIROXICAM', 'PIROXISAPH-20', 1, NULL, NULL, 20.00, 'mg', 50.00, 100, 0, 'GEN-00003', 1, '2025-05-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(25, 'IRBESARTAN', 'CENTRAMED', 2, NULL, NULL, 150.00, 'mg', 50.00, 100, 0, '4806522630659', 1, '2024-08-01 00:00:00', '2024-12-16 05:08:52', '2024-12-17 07:51:56'),
(26, 'GLICLAZIDE', 'ZEBET', 1, NULL, NULL, 80.00, 'mg', 50.00, 100, 0, '4806511300327', 1, '2027-02-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(27, 'METFORMIN', 'FORMET', 1, NULL, NULL, 500.00, 'mg', 50.00, 300, 0, '4806505141387', 1, '2026-03-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(28, 'FUROSEMIDE', 'DM', 1, NULL, NULL, 20.00, 'mg', 50.00, 60, 0, '4806520351099', 1, '2026-01-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(29, 'LOSARTAN', 'LOSAAR', 1, NULL, NULL, 100.00, 'mg', 50.00, 100, 0, '4806524146776', 1, '2027-04-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(30, 'ASPIRIN', 'SAPHRIN', 1, NULL, NULL, 80.00, 'mg', 50.00, 100, 0, '8906043320568', 0, '2026-05-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(31, 'ROSUVASTATIN', 'ROSUSAPH-40', 1, NULL, NULL, 40.00, 'mg', 50.00, 200, 0, '8906043322982', 1, '2025-06-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(32, 'ROSUVASTATIN', 'ROSUSAPH-10', 1, NULL, NULL, 10.00, 'mg', 50.00, 100, 0, '8906043324535', 1, '2025-12-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(33, 'SALBUTAMOL + GUAIFENASIN', 'VENTREX-G', 1, NULL, NULL, NULL, NULL, 50.00, 100, 0, '4806523302517', 1, '2026-07-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(34, 'OFLOXACIN', 'FLOXA-200', 1, NULL, NULL, 200.00, 'mg', 50.00, 100, 0, '4806505140564', 1, '2025-06-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(35, 'LAGUNDI', 'OFPLEMED FORTE', 1, NULL, NULL, 600.00, 'mg', 50.00, 100, 0, '4806527193784', 0, '2026-03-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(36, 'PHOSPHOLIPID', 'SN-PHOS', 1, NULL, NULL, NULL, NULL, 50.00, 100, 0, '4806523430746', 0, '2025-04-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(37, 'ATORVASTATIN', 'RANVAST', 1, NULL, NULL, 20.00, 'mg', 50.00, 200, 0, '4806505141004', 1, '2027-02-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(38, 'ROSUVASTATIN', 'ROSUSAPH-20', 1, NULL, NULL, 20.00, 'mg', 50.00, 100, 0, 'GEN-00004', 1, '2025-03-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(39, 'ACETYLCYSTEIN', 'FLUCYSTEIN', 1, NULL, NULL, 600.00, 'mg', 50.00, 50, 0, '8906005114907', 1, '2026-03-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(40, 'ORS', 'AMBILYE', 1, NULL, NULL, NULL, NULL, 50.00, 100, 0, '4806524149333', 0, '2025-05-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(41, 'SAMBONG', 'URISAM', 1, NULL, NULL, 500.00, 'mg', 50.00, 100, 0, '4806505491840', 0, '2025-07-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(42, 'ACETYLCYSTEIN', 'FLUCYSTEIN', 1, NULL, NULL, 600.00, 'mg', 50.00, 30, 0, '8906005115966', 1, '2026-03-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(43, 'ASCORBIC ACID', 'MYREVIT C', 1, NULL, NULL, 500.00, 'mg', 50.00, 400, 0, '4806523301695', 0, '2026-04-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(44, 'CALCIUM CARBONATE', 'CALBORNATE', 1, NULL, NULL, 500.00, 'mg', 50.00, 400, 0, '4806035219150', 0, '2026-08-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(45, 'ASCORBIC ACID', 'ASCOPHIL', 1, NULL, NULL, 500.00, 'mg', 50.00, 300, 0, '4806524140873', 0, '2026-05-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(46, 'OMEPRAZOLE', 'ZOSEC', 1, NULL, NULL, 20.00, 'mg', 50.00, 100, 0, '4806505140168', 1, '2026-05-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(47, 'ROSUVASTATIN', 'ROZATIN-10', 1, NULL, NULL, 10.00, 'mg', 50.00, 100, 0, '4806037100289', 1, '2027-03-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(48, 'ATORVASTATIN', 'FREDTOR', 1, NULL, NULL, 10.00, 'mg', 50.00, 100, 0, '4806524149074', 1, '2026-07-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(49, 'B-COMPLEX', 'REVITAPLEX', 1, NULL, NULL, NULL, NULL, 50.00, 200, 0, '4809015348017', 0, '2026-03-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(50, 'METOPROLOL', 'PROMETIN-100', 1, NULL, NULL, 100.00, 'mg', 50.00, 200, 0, 'GEN-00005', 1, '2025-02-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(51, 'DEXAMETHASONE', 'DEXAT', 1, NULL, NULL, 500.00, 'mg', 50.00, 164, 0, '4806504261185', 1, '2024-07-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(52, 'ETORICOXIB', 'XIBORA-90', 1, NULL, NULL, 90.00, 'mg', 50.00, 50, 0, '18904083842979', 1, '2026-02-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(53, 'PROPRANOLOL', 'ORANOL', 1, NULL, NULL, 40.00, 'mg', 50.00, 170, 0, '4806505141578', 1, '2025-04-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(54, 'FERROUS + FOLIC', 'AMECIRON', 1, NULL, NULL, NULL, NULL, 50.00, 300, 0, '4806504084104', 0, '2025-02-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(55, 'METOPROLOL', 'MYPROL', 1, NULL, NULL, 50.00, 'mg', 50.00, 100, 0, '4806523303637', 1, '2025-01-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(56, 'AMBROXOL', 'SAOHROXOL C75', 1, NULL, NULL, 75.00, 'mg', 50.00, 80, 0, 'GEN-00006', 0, '2025-07-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(57, 'METHYLPREDNISOLONE', 'METHYDEN', 1, NULL, NULL, 16.00, 'mg', 50.00, 100, 0, '8906083440608', 1, '2026-06-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(58, 'FOLIC ACID', 'FOLINOVA', 1, NULL, NULL, 5.00, 'mg', 50.00, 100, 0, '4806534570660', 0, '2025-06-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(59, 'CARVEDILOL', 'KARVIDOL', 1, NULL, NULL, 25.00, 'mg', 50.00, 40, 0, '4806505140724', 1, '2026-09-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(60, 'GLIMEPRIDE', 'GLIMESAPH T2', 1, NULL, NULL, 2.00, 'mg', 50.00, 100, 0, '8906043320667', 1, '2026-06-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(61, 'CALCIUM CARBONATE', 'AMBICAL', 1, NULL, NULL, 500.00, 'mg', 50.00, 100, 0, '4806524149357', 0, '2026-05-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(62, 'FENOFIBRATE', 'FENOCARE', 1, NULL, NULL, 200.00, 'mg', 50.00, 380, 0, '4806505141240', 1, '2025-06-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(63, 'OMEPRAZOLE', 'OMEPHIL-20', 1, NULL, NULL, 20.00, 'mg', 50.00, 452, 0, '4806524142327', 1, '2025-08-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(64, 'OMEPRAZOLE', 'RANZOLE', 1, NULL, NULL, 40.00, 'mg', 50.00, 40, 0, '4806524140699', 1, '2027-04-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(65, 'OMEPRAZOLE', 'INHIBITA', 1, NULL, NULL, 40.00, 'mg', 50.00, 100, 0, '8944161210774', 1, '2027-05-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(66, 'OMEPRAZOLE', 'OMETIFT', 1, NULL, NULL, 20.00, 'mg', 50.00, 200, 0, '8901530002033', 1, '2024-12-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(67, 'MULTIVITAMINS', 'MULTICAPS', 1, NULL, NULL, NULL, NULL, 50.00, 100, 0, '4806527201342', 0, '2026-10-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(68, 'CARBOCISTEINE', 'MUCOFLEM', 1, NULL, NULL, 500.00, 'mg', 50.00, 80, 0, 'GEN-00007', 1, '2026-05-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(69, 'EVENING PRIMROSE', 'E-ROSE', 1, NULL, NULL, 1000.00, 'mg', 50.00, 30, 0, '4806524143324', 0, '2024-11-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(70, 'CARBOCISTEINE', 'MUCOXPEL', 1, NULL, NULL, 500.00, 'mg', 50.00, 190, 0, '4806527190714', 1, '2026-06-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(71, 'MULTIVITAMINS', 'MYREVIT', 1, NULL, NULL, NULL, NULL, 50.00, 100, 0, '4806523302333', 0, '2026-06-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(72, 'MULTIVITAMINS', 'HANIZYN', 1, NULL, NULL, NULL, NULL, 50.00, 500, 0, '4806529430498', 0, '2025-07-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(73, 'SPIRONOLACTONE', 'SPIRODEN', 1, NULL, NULL, 25.00, 'mg', 50.00, 63, 0, '8906041275778', 1, '2025-02-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(74, 'POTASSIUM CHLORIDE', 'KALIUSAPHRIDE', 1, NULL, NULL, 600.00, 'mg', 50.00, 100, 0, 'GEN-00008', 1, '2025-02-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(75, 'GLIBENCLAMIDE', 'GLIMIDE', 1, NULL, NULL, 5.00, 'mg', 50.00, 100, 0, '4806524141849', 1, '2025-02-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(76, 'POTASSIUM CITRATE', 'ALKALINSE', 1, NULL, NULL, 1080.00, 'mg', 50.00, 100, 0, '4806508841536', 1, '2025-04-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(77, 'PARACETAMOL', 'TEMPAID', 1, NULL, NULL, 500.00, 'mg', 50.00, 300, 0, '4806527195139', 0, '2025-02-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(78, 'PARACETAMOL', '4FEVER', 1, NULL, NULL, 500.00, 'mg', 50.00, 0, 0, 'GEN-00009', 0, NULL, '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(79, 'FERROUS SULFATE', 'COM -FEMIC', 1, NULL, NULL, 500.00, 'mg', 50.00, 27, 0, '4806531900347', 0, '2025-05-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(80, 'CETIRIZINE', 'CETIRILIFE', 1, NULL, NULL, 10.00, 'mg', 50.00, 800, 0, '8906117651871', 0, '2026-12-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(81, 'AZITHROMYCIN', 'GENZITH', 1, NULL, NULL, 500.00, 'mg', 50.00, 54, 0, '8904179017802', 1, '2027-05-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(82, 'CEFIXIME', 'SUPRAPHIL', 1, NULL, NULL, 200.00, 'mg', 50.00, 30, 0, '4806037100449', 1, '2025-09-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(83, 'CEFUROXIME', 'AEROX', 1, NULL, NULL, 500.00, 'mg', 50.00, 60, 0, '4806524147148', 1, '2027-05-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(84, 'CLOXACILLIN', 'PHILCLOX', 1, NULL, NULL, 500.00, 'mg', 50.00, 300, 0, '4806524140941', 1, '2026-02-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(85, 'CEFALEXIN', 'EXEL', 1, NULL, NULL, 500.00, 'mg', 50.00, 300, 0, '4806523301893', 1, '2026-06-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(86, 'CEFACLOR', 'CEFLOR', 1, NULL, NULL, 500.00, 'mg', 50.00, 100, 0, '4800301904610', 1, '2025-05-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(87, 'CELECOXIB', 'EMICOX', 1, NULL, NULL, 200.00, 'mg', 50.00, 70, 0, '4806524147131', 1, '2027-01-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(88, 'CELECOXIB', 'SAPHLECOX', 1, NULL, NULL, 400.00, 'mg', 50.00, 100, 0, '8906043322616', 1, '2026-02-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(89, 'CELECOXIB', 'SAPHLECOX', 1, NULL, NULL, 200.00, 'mg', 50.00, 70, 0, '8906043320032', 1, '2026-12-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(90, 'FENOFIBRATE', 'FENOSAPH', 1, NULL, NULL, 160.00, 'mg', 50.00, 200, 0, '8906043324887', 1, '2026-11-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(91, 'CELECOXIB', 'EMICOX', 1, NULL, NULL, 400.00, 'mg', 50.00, 100, 0, '4806524147155', 1, '2026-04-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(92, 'MONTELUKAST', 'GENTAKAST-10', 1, NULL, NULL, 10.00, 'mg', 50.00, 100, 0, '8904182012610', 1, '2027-02-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(93, 'ZILGAM', '', 1, NULL, NULL, NULL, NULL, 50.00, 600, 0, '4806505141271', 0, '2026-03-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(94, 'BELLOID', '', 1, NULL, NULL, 10.00, 'mg', 50.00, 100, 0, '8906009600055', 1, '2025-01-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(95, 'COTRIMAXOL', '', 1, NULL, NULL, 480.00, 'mg', 50.00, 100, 0, '4806520350726', 1, '2025-10-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(96, 'MELMAG', '', 1, NULL, NULL, NULL, NULL, 50.00, 200, 0, '4806529430696', 0, '2026-02-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(97, 'KATHREX 960', '', 1, NULL, NULL, NULL, NULL, 50.00, 200, 0, '4806523302067', 1, '2026-09-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(98, 'CEFUROXIME', 'REGIXIME', 1, NULL, NULL, 500.00, 'mg', 50.00, 100, 0, '4806035220101', 1, '2027-06-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(99, 'AMLODIPINE', 'RETAVASC-5', 1, NULL, NULL, 5.00, 'mg', 50.00, 1000, 0, '4806533602355', 1, '2026-03-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(100, 'TELMISARTAN', 'ORATEL-40', 1, NULL, NULL, 40.00, 'mg', 50.00, 60, 0, '8906045607728', 1, '2027-06-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(101, 'KETOANALOGUE', 'KETOMIRIN', 1, NULL, NULL, NULL, NULL, 50.00, 100, 0, '4809015705865', 1, '2026-08-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(102, 'METFORMIN', 'MYMET', 1, NULL, NULL, 500.00, 'mg', 50.00, 200, 0, '4806523302593', 1, '2027-06-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(103, 'LOSARTAN POTASSIUM', 'RETAZART', 1, NULL, NULL, 50.00, 'mg', 50.00, 800, 0, '8904179017819', 1, '2027-05-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(104, 'GLICLAZIDE', 'AGLIC MR', 1, NULL, NULL, 30.00, 'mg', 50.00, 30, 0, 'GEN-00010', 1, '2026-08-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(105, 'ROSULVASTATIN', 'X-PLENDED', 1, NULL, NULL, 10.00, 'mg', 50.00, 100, 0, '8964001420149', 1, '2025-03-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(106, 'ATORVASTATIN', 'ATORBET', 1, NULL, NULL, 20.00, 'mg', 50.00, 200, 0, '8904180804453', 1, '2026-08-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(107, 'MULTIVITAMINS B1+B6+B12', 'REVITPLEX', 1, NULL, NULL, 100.00, 'mg', 50.00, 200, 0, 'GEN-00011', 0, '2025-09-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(108, 'ETORICOXIB', 'ETORINOV-120', 1, NULL, NULL, 120.00, 'mg', 50.00, 60, 0, '4806534570691', 1, '2026-06-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(109, 'CETIRIZINE DIHYDROCHLORIDE', 'RETANIX', 1, NULL, NULL, 10.00, 'mg', 50.00, 300, 0, '8904130424502', 0, '2026-03-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(110, 'MEFENAMIC ACID', 'INFAMIX', 1, NULL, NULL, 500.00, 'mg', 50.00, 300, 0, '4806527191056', 0, '2025-12-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(111, 'SALBUTAMOL', 'SALBPRESS', 1, NULL, NULL, 100.00, 'mcg', 50.00, 3, 0, '6921665004803', 1, '2027-05-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(112, 'AMOXICILLIN', 'AXMEL', 1, NULL, NULL, 250.00, 'mg/ml', 50.00, 10, 0, '4806523301336', 1, '2027-10-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(113, 'CO-AMOXICLAV', 'ORAPEN-S', 1, NULL, NULL, 312.50, 'mg', 50.00, 3, 0, '8906016617923', 1, '2026-05-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(114, 'AMBROXOL', 'COUXIN', 1, NULL, NULL, 15.00, 'mg/ml', 50.00, 8, 0, '4806529430047', 0, '2027-02-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(115, 'CO-AMOXICLAV', 'COBELXI-457', 1, NULL, NULL, 457.00, 'mg/ml', 50.00, 3, 0, '4806533603000', 1, '2026-03-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(117, 'CETIRIZINE', 'CETIREX', 1, NULL, NULL, 5.00, 'mg/ml', 50.00, 5, 0, '4806523302708', 0, '2026-08-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(118, 'CO-AMOXICLAV', 'ORPENS-S', 1, NULL, NULL, 156.50, 'mg', 50.00, 3, 0, '8906016618135', 1, '2024-05-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(119, 'SALBUTAMOL + IPRATROPIUM', 'DUOMED', 1, NULL, NULL, NULL, NULL, 50.00, 2, 0, '8906076770392', 1, '2024-06-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(120, 'SALBUTAMOL', 'RETAVENT', 1, NULL, NULL, 1.00, 'mg/ml', 50.00, 3, 0, '8906076770286', 1, '2026-05-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(121, 'BUCLIZINE HD', 'APPETANYX', 1, NULL, NULL, 25.00, 'mg', 50.00, 100, 0, '4806527651321', 0, '2026-07-01 00:00:00', '2024-12-16 05:08:52', '2024-12-16 05:08:52'),
(133, '50.00', '', 1, 'ggggg', 'ggggg', NULL, NULL, 22.00, 22, 0, '60', 1, NULL, NULL, NULL),
(134, 'f', '', 1, 'ff', 'fff', NULL, NULL, 12.00, 2, 0, 'f', 1, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` int(11) NOT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `pharmacist_session_id` int(11) DEFAULT NULL,
  `customer_name` varchar(100) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `discount_amount` decimal(10,2) DEFAULT 0.00,
  `discount_type` enum('None','Senior','PWD','Employee','Points') DEFAULT 'None',
  `discount_id_number` varchar(50) DEFAULT NULL,
  `payment_method` enum('cash','card','gcash','maya') NOT NULL,
  `payment_status` enum('paid','pending','cancelled','refunded') NOT NULL DEFAULT 'pending',
  `points_earned` int(11) DEFAULT 0,
  `points_redeemed` int(11) DEFAULT 0,
  `branch_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `daily_sequence` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `sales`
--
DELIMITER $$
CREATE TRIGGER `sales_before_insert` BEFORE INSERT ON `sales` FOR EACH ROW BEGIN
  SET NEW.daily_sequence = (
    SELECT COALESCE(MAX(daily_sequence), 0) + 1
    FROM sales
    WHERE branch_id = NEW.branch_id
    AND DATE(created_at) = DATE(NEW.created_at)
  );
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `sales_payments`
--

CREATE TABLE `sales_payments` (
  `payment_id` int(11) NOT NULL,
  `sale_id` int(11) NOT NULL,
  `payment_method` enum('cash','card','gcash','maya') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_returns`
--

CREATE TABLE `sales_returns` (
  `return_id` int(11) NOT NULL,
  `sale_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `reason` text NOT NULL,
  `refund_amount` decimal(10,2) NOT NULL,
  `pharmacist_id` int(11) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_sessions`
--

CREATE TABLE `sales_sessions` (
  `session_id` int(11) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `start_time` timestamp NULL DEFAULT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  `total_sales` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales_sessions`
--

INSERT INTO `sales_sessions` (`session_id`, `branch_id`, `start_time`, `end_time`, `total_sales`, `created_at`, `updated_at`) VALUES
(1, 1, '2024-12-18 22:30:15', NULL, 0.00, '2024-12-18 22:30:15', '2024-12-18 22:30:15'),
(2, 1, '2024-12-18 22:30:45', NULL, 0.00, '2024-12-18 22:30:45', '2024-12-18 22:30:45'),
(3, 1, '2024-12-18 22:34:40', NULL, 0.00, '2024-12-18 22:34:40', '2024-12-18 22:34:40'),
(4, 1, '2024-12-18 22:35:11', NULL, 0.00, '2024-12-18 22:35:11', '2024-12-18 22:35:11'),
(5, 1, '2024-12-18 22:38:56', NULL, 0.00, '2024-12-18 22:38:56', '2024-12-18 22:38:56'),
(6, 1, '2024-12-18 22:39:27', NULL, 0.00, '2024-12-18 22:39:27', '2024-12-18 22:39:27'),
(7, 1, '2024-12-18 22:42:15', NULL, 0.00, '2024-12-18 22:42:15', '2024-12-18 22:42:15'),
(8, 1, '2024-12-18 22:42:55', NULL, 0.00, '2024-12-18 22:42:55', '2024-12-18 22:42:55'),
(9, 1, '2024-12-18 22:45:08', NULL, 0.00, '2024-12-18 22:45:08', '2024-12-18 22:45:08'),
(10, 1, '2024-12-18 22:46:02', NULL, 0.00, '2024-12-18 22:46:02', '2024-12-18 22:46:02'),
(11, 1, '2024-12-18 22:50:35', NULL, 0.00, '2024-12-18 22:50:35', '2024-12-18 22:50:35'),
(12, 1, '2024-12-18 22:55:51', NULL, 0.00, '2024-12-18 22:55:51', '2024-12-18 22:55:51'),
(13, 1, '2024-12-18 23:00:01', NULL, 0.00, '2024-12-18 23:00:01', '2024-12-18 23:00:01'),
(14, 3, '2024-12-18 23:08:34', NULL, 0.00, '2024-12-18 23:08:34', '2024-12-18 23:08:34'),
(15, 1, '2024-12-18 23:23:56', NULL, 0.00, '2024-12-18 23:23:56', '2024-12-18 23:23:56'),
(16, 1, '2024-12-19 00:10:10', NULL, 0.00, '2024-12-19 00:10:10', '2024-12-19 00:10:10'),
(17, 1, '2024-12-19 00:18:31', NULL, 0.00, '2024-12-19 00:18:31', '2024-12-19 00:18:31'),
(18, 1, '2024-12-19 00:22:19', NULL, 0.00, '2024-12-19 00:22:19', '2024-12-19 00:22:19'),
(19, 2, '2024-12-19 00:27:33', NULL, 0.00, '2024-12-19 00:27:33', '2024-12-19 00:27:33'),
(20, 1, '2024-12-19 00:47:46', NULL, 0.00, '2024-12-19 00:47:46', '2024-12-19 00:47:46'),
(21, 1, '2024-12-19 08:59:12', NULL, 0.00, NULL, NULL),
(22, 1, '2024-12-19 09:05:45', NULL, 0.00, '2024-12-19 09:05:45', '2024-12-19 09:05:45'),
(23, 1, '2024-12-19 09:14:13', NULL, 0.00, '2024-12-19 09:14:13', '2024-12-19 09:14:13'),
(24, 1, '2024-12-19 09:40:51', NULL, 0.00, '2024-12-19 09:40:51', '2024-12-19 09:40:51'),
(25, 1, '2024-12-19 10:04:42', NULL, 0.00, '2024-12-19 10:04:42', '2024-12-19 10:04:42'),
(26, 1, '2024-12-19 10:09:03', NULL, 0.00, '2024-12-19 10:09:03', '2024-12-19 10:09:03'),
(27, 1, '2024-12-19 10:12:52', NULL, 0.00, '2024-12-19 10:12:52', '2024-12-19 10:12:52'),
(28, 1, '2024-12-19 10:17:15', NULL, 0.00, '2024-12-19 10:17:15', '2024-12-19 10:17:15'),
(29, 3, '2024-12-19 10:20:32', '2024-12-19 10:20:40', 0.00, '2024-12-19 10:20:32', '2024-12-19 10:20:40'),
(30, 3, '2024-12-19 10:23:29', '2024-12-19 10:23:37', 0.00, '2024-12-19 10:23:29', '2024-12-19 10:23:37'),
(31, 1, '2024-12-19 10:28:13', '2024-12-19 10:40:33', 0.00, '2024-12-19 10:28:13', '2024-12-19 10:40:33'),
(32, 1, '2024-12-19 10:40:40', NULL, 0.00, '2024-12-19 10:40:40', '2024-12-19 10:40:40');

-- --------------------------------------------------------

--
-- Table structure for table `sale_items`
--

CREATE TABLE `sale_items` (
  `id` int(11) NOT NULL,
  `sale_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `SKU` enum('Piece','Box') NOT NULL,
  `prescription_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `star_points`
--

CREATE TABLE `star_points` (
  `star_points_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `points_balance` int(11) NOT NULL DEFAULT 0,
  `total_points_earned` int(11) NOT NULL DEFAULT 0,
  `total_points_redeemed` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `star_points`
--

INSERT INTO `star_points` (`star_points_id`, `customer_id`, `points_balance`, `total_points_earned`, `total_points_redeemed`, `created_at`, `updated_at`) VALUES
(1, 1, 500, 500, 0, '2024-12-10 07:03:21', '2024-12-10 07:03:21'),
(2, 2, 750, 750, 0, '2024-12-10 07:03:21', '2024-12-10 07:03:21');

-- --------------------------------------------------------

--
-- Table structure for table `star_points_transactions`
--

CREATE TABLE `star_points_transactions` (
  `transaction_id` int(11) NOT NULL,
  `star_points_id` int(11) NOT NULL,
  `points_amount` int(11) NOT NULL,
  `transaction_type` enum('EARNED','REDEEMED') NOT NULL,
  `reference_transaction_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `test_accounts`
--

CREATE TABLE `test_accounts` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `employee_id` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `remarks` varchar(255) NOT NULL,
  `role` enum('ADMIN','MANAGER','PHARMACIST') NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `hired_at` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `employee_id`, `name`, `password`, `remarks`, `role`, `email`, `phone`, `branch_id`, `is_active`, `hired_at`, `created_at`, `updated_at`) VALUES
(1, '10000001', 'Janeth Escala', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '', 'ADMIN', '', '0', 1, 1, '0000-00-00', '2024-12-10 07:03:20', '2024-12-15 10:52:07'),
(2, '10000002', 'Rusty Lacerna', '$2a$10$IY3paAtK.4hxQhuuYZDT/.GTRquKlenw7yD0ykCDBZSzL0Y2wegii', '', 'ADMIN', 'lugtubealyssa@gmail.com', '0', 2, 1, '0000-00-00', '2024-12-10 07:03:20', '2024-12-19 10:08:43'),
(3, '10000003', 'Kevin Llanes', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpfQN2YW3qy6oS', 'Developer', 'ADMIN', 'kevsllanes@gmail.com', '09667751474', 1, 1, '2024-12-19', '2024-12-18 23:13:46', '2024-12-18 23:25:32'),
(4, '000', 'System Administrator', '$2a$10$tU.PLkN2LcgpFmrOabGj5uflgK/YPrHlHyHzNc3AEq4y4Bw770NqO', 'Main system administrator account', 'ADMIN', 'kevsllanes@gmail.com', '123456789', NULL, 1, '2024-12-18', '2024-12-18 23:26:53', '2024-12-19 09:31:38'),
(5, '001', 'System Administrator', '$2a$10$uPFn2/u0eD44Ru6Co2K01uESpUPE08m/8HGFOFIlIfAWcEnXEKkYK', 'Main system administrator account', 'ADMIN', 'iflrix2704@gmail.com', '123456789', NULL, 1, '2024-12-18', '2024-12-18 23:28:22', '2024-12-19 00:00:53');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`branch_id`);

--
-- Indexes for table `branch_inventory`
--
ALTER TABLE `branch_inventory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `branch_id` (`branch_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `cash_reconciliation`
--
ALTER TABLE `cash_reconciliation`
  ADD PRIMARY KEY (`reconciliation_id`),
  ADD KEY `pharmacist_session_id` (`pharmacist_session_id`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`category_id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`customer_id`);

--
-- Indexes for table `pharmacist`
--
ALTER TABLE `pharmacist`
  ADD PRIMARY KEY (`staff_id`),
  ADD UNIQUE KEY `pin_code` (`pin_code`),
  ADD KEY `branch_id` (`branch_id`);

--
-- Indexes for table `pharmacist_sessions`
--
ALTER TABLE `pharmacist_sessions`
  ADD PRIMARY KEY (`pharmacist_session_id`),
  ADD KEY `session_id` (`session_id`),
  ADD KEY `staff_id` (`staff_id`) USING BTREE;

--
-- Indexes for table `prescriptions`
--
ALTER TABLE `prescriptions`
  ADD PRIMARY KEY (`prescription_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `prescription_items`
--
ALTER TABLE `prescription_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `prescription_id` (`prescription_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `barcode` (`barcode`),
  ADD KEY `category` (`category`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `pharmacist_session_id` (`pharmacist_session_id`),
  ADD KEY `idx_invoice_number` (`invoice_number`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_branch_customer` (`branch_id`,`customer_id`);

--
-- Indexes for table `sales_payments`
--
ALTER TABLE `sales_payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `sale_id` (`sale_id`);

--
-- Indexes for table `sales_returns`
--
ALTER TABLE `sales_returns`
  ADD PRIMARY KEY (`return_id`),
  ADD KEY `sale_id` (`sale_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `pharmacist_id` (`pharmacist_id`);

--
-- Indexes for table `sales_sessions`
--
ALTER TABLE `sales_sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `branch_id` (`branch_id`);

--
-- Indexes for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `prescription_id` (`prescription_id`),
  ADD KEY `idx_sale_product` (`sale_id`,`product_id`);

--
-- Indexes for table `star_points`
--
ALTER TABLE `star_points`
  ADD PRIMARY KEY (`star_points_id`),
  ADD UNIQUE KEY `customer_id` (`customer_id`);

--
-- Indexes for table `star_points_transactions`
--
ALTER TABLE `star_points_transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `star_points_id` (`star_points_id`);

--
-- Indexes for table `test_accounts`
--
ALTER TABLE `test_accounts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `employee_id` (`employee_id`),
  ADD KEY `branch_id` (`branch_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `branch_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `branch_inventory`
--
ALTER TABLE `branch_inventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cash_reconciliation`
--
ALTER TABLE `cash_reconciliation`
  MODIFY `reconciliation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `customer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `pharmacist`
--
ALTER TABLE `pharmacist`
  MODIFY `staff_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `pharmacist_sessions`
--
ALTER TABLE `pharmacist_sessions`
  MODIFY `pharmacist_session_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `prescriptions`
--
ALTER TABLE `prescriptions`
  MODIFY `prescription_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `prescription_items`
--
ALTER TABLE `prescription_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=135;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales_payments`
--
ALTER TABLE `sales_payments`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales_returns`
--
ALTER TABLE `sales_returns`
  MODIFY `return_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales_sessions`
--
ALTER TABLE `sales_sessions`
  MODIFY `session_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `sale_items`
--
ALTER TABLE `sale_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `star_points`
--
ALTER TABLE `star_points`
  MODIFY `star_points_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `star_points_transactions`
--
ALTER TABLE `star_points_transactions`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `branch_inventory`
--
ALTER TABLE `branch_inventory`
  ADD CONSTRAINT `branch_inventory_ibfk_1` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`),
  ADD CONSTRAINT `branch_inventory_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `cash_reconciliation`
--
ALTER TABLE `cash_reconciliation`
  ADD CONSTRAINT `cash_reconciliation_ibfk_1` FOREIGN KEY (`pharmacist_session_id`) REFERENCES `pharmacist_sessions` (`pharmacist_session_id`);

--
-- Constraints for table `pharmacist`
--
ALTER TABLE `pharmacist`
  ADD CONSTRAINT `pharmacist_ibfk_1` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`);

--
-- Constraints for table `pharmacist_sessions`
--
ALTER TABLE `pharmacist_sessions`
  ADD CONSTRAINT `pharmacist_sessions_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sales_sessions` (`session_id`),
  ADD CONSTRAINT `pharmacist_sessions_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `pharmacist` (`staff_id`);

--
-- Constraints for table `prescriptions`
--
ALTER TABLE `prescriptions`
  ADD CONSTRAINT `prescriptions_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`);

--
-- Constraints for table `prescription_items`
--
ALTER TABLE `prescription_items`
  ADD CONSTRAINT `prescription_items_ibfk_1` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`prescription_id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category`) REFERENCES `category` (`category_id`);

--
-- Constraints for table `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`),
  ADD CONSTRAINT `sales_ibfk_2` FOREIGN KEY (`pharmacist_session_id`) REFERENCES `pharmacist_sessions` (`pharmacist_session_id`),
  ADD CONSTRAINT `sales_ibfk_3` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`);

--
-- Constraints for table `sales_payments`
--
ALTER TABLE `sales_payments`
  ADD CONSTRAINT `sales_payments_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`);

--
-- Constraints for table `sales_returns`
--
ALTER TABLE `sales_returns`
  ADD CONSTRAINT `sales_returns_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`),
  ADD CONSTRAINT `sales_returns_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `sales_returns_ibfk_3` FOREIGN KEY (`pharmacist_id`) REFERENCES `pharmacist` (`staff_id`);

--
-- Constraints for table `sales_sessions`
--
ALTER TABLE `sales_sessions`
  ADD CONSTRAINT `sales_sessions_ibfk_1` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`);

--
-- Constraints for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD CONSTRAINT `sale_items_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`),
  ADD CONSTRAINT `sale_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `sale_items_ibfk_3` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`prescription_id`);

--
-- Constraints for table `star_points`
--
ALTER TABLE `star_points`
  ADD CONSTRAINT `star_points_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`);

--
-- Constraints for table `star_points_transactions`
--
ALTER TABLE `star_points_transactions`
  ADD CONSTRAINT `star_points_transactions_ibfk_1` FOREIGN KEY (`star_points_id`) REFERENCES `star_points` (`star_points_id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
