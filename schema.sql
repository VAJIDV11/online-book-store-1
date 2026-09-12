-- ========================================================
-- Online Book Store Database Schema
-- Database: bookstore_db
-- ========================================================

CREATE DATABASE IF NOT EXISTS `bookstore_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `bookstore_db`;

-- --------------------------------------------------------
-- 1. Table structure for table `users`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `books`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('user', 'admin') DEFAULT 'user',
  `phone` VARCHAR(20) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 2. Table structure for table `categories`
-- --------------------------------------------------------
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `slug` VARCHAR(120) NOT NULL UNIQUE,
  `icon` VARCHAR(50) DEFAULT 'fa-book',
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 3. Table structure for table `books`
-- --------------------------------------------------------
CREATE TABLE `books` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `author` VARCHAR(150) NOT NULL,
  `isbn` VARCHAR(20) UNIQUE DEFAULT NULL,
  `description` TEXT NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `discount_price` DECIMAL(10,2) DEFAULT NULL,
  `stock_quantity` INT NOT NULL DEFAULT 0,
  `cover_image` VARCHAR(500) DEFAULT NULL,
  `rating` DECIMAL(2,1) DEFAULT 4.5,
  `rating_count` INT DEFAULT 12,
  `is_featured` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_books_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 4. Table structure for table `orders`
-- --------------------------------------------------------
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `shipping_name` VARCHAR(100) NOT NULL,
  `shipping_email` VARCHAR(150) NOT NULL,
  `shipping_phone` VARCHAR(20) NOT NULL,
  `shipping_address` TEXT NOT NULL,
  `payment_method` VARCHAR(50) DEFAULT 'Card Simulation',
  `payment_status` ENUM('Pending', 'Paid', 'Failed') DEFAULT 'Paid',
  `order_status` ENUM('Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Processing',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 5. Table structure for table `order_items`
-- --------------------------------------------------------
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `book_id` INT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(10,2) NOT NULL,
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 6. Table structure for table `cart_items`
-- --------------------------------------------------------
CREATE TABLE `cart_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `book_id` INT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `user_book_unique` (`user_id`, `book_id`),
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- SEED DATA
-- Default Passwords:
-- Admin: Admin@12345 -> $2a$10$Ew.Y2bN8fC9G8V9eM7qgfe1p2dG9FqWlJ8E5j7o2l.9n9G.uE7.j2
-- User:  User@12345  -> $2a$10$rN.0O1fQY7kO0Fq7U7y/pe8m4aE9F1VlM8E5j7o2l.9n9G.uE7.j2
-- ========================================================

-- Insert Categories
INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `description`) VALUES
(1, 'Technology & Programming', 'technology', 'fa-laptop-code', 'Cutting-edge software development, AI, cloud computing, and cybersecurity books.'),
(2, 'Fiction & Literature', 'fiction', 'fa-feather-pointed', 'Captivating novels, timeless classics, thrillers, and award-winning fiction.'),
(3, 'Science & Nature', 'science', 'fa-atom', 'Explorations into the cosmos, quantum physics, biology, and the natural world.'),
(4, 'Business & Finance', 'business', 'fa-chart-line', 'Proven strategies in leadership, entrepreneurship, investing, and economics.'),
(5, 'Self-Help & Psychology', 'self-help', 'fa-brain', 'Practical guides on productivity, emotional intelligence, habits, and mindset.');

-- Insert Default Users (Admin & Customer)
-- Passwords:
-- Admin: Admin@12345
-- User:  User@12345
INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role`, `phone`, `address`) VALUES
(1, 'System Administrator', 'admin@bookstore.com', '$2a$10$haaSqhIkVLqkNNM28o3RvObJ5E9l64cI3HPU0CGpUurp3MBkJbKC6', 'admin', '+1 (555) 019-2834', '100 Tech Hub Blvd, Suite 400, Silicon Valley, CA'),
(2, 'Alex Johnson', 'user@bookstore.com', '$2a$10$PdXdfZC7bvZGMlGPG/QAF.8JZUr5QhxGt8uPXMY3SrRCGsinnCFYW', 'user', '+1 (555) 382-9912', '742 Evergreen Terrace, Springfield, OR');

-- Insert Books
INSERT INTO `books` (`id`, `category_id`, `title`, `author`, `isbn`, `description`, `price`, `discount_price`, `stock_quantity`, `cover_image`, `rating`, `rating_count`, `is_featured`) VALUES
(1, 1, 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', '9780132350884', 'Even bad code can function. But if code is not clean, it can bring a development organization to its knees. Clean Code helps developers write robust, readable, and maintainable software.', 44.99, 36.99, 35, 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg', 4.8, 142, TRUE),
(2, 1, 'Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', '9780201633610', 'Capturing a wealth of experience about the design of object-oriented software, four top-notch designers present a catalog of simple and succinct solutions to commonly occurring design problems.', 54.99, 48.50, 20, 'https://covers.openlibrary.org/b/isbn/9780201633610-L.jpg', 4.7, 98, TRUE),
(3, 1, 'Designing Data-Intensive Applications', 'Martin Kleppmann', '9781449373320', 'Data is at the center of many challenges in system design today. This comprehensive guide helps you navigate the diverse landscape of databases, distributed caches, and stream processors.', 49.99, 41.99, 28, 'https://covers.openlibrary.org/b/isbn/9781449373320-L.jpg', 4.9, 210, TRUE),
(4, 1, 'You Don''t Know JS Yet: Scope & Closures', 'Kyle Simpson', '9781093370776', 'Part of the best-selling series that dives deep into the core mechanisms of JavaScript that every developer should master.', 24.99, NULL, 50, 'https://covers.openlibrary.org/b/isbn/9781093370776-L.jpg', 4.6, 64, FALSE),

(5, 2, 'The Midnight Library', 'Matt Haig', '9780525559474', 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.', 26.00, 18.99, 42, 'https://covers.openlibrary.org/b/isbn/9780525559474-L.jpg', 4.5, 320, TRUE),
(6, 2, 'Project Hail Mary', 'Andy Weir', '9780593135204', 'Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself are doomed.', 28.99, 22.50, 15, 'https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg', 4.9, 185, TRUE),
(7, 2, 'Klara and the Sun', 'Kazuo Ishiguro', '9780593318171', 'From the Nobel laureate author comes a magnificent new novel that asks the profound question: what does it mean to love?', 27.00, NULL, 18, 'https://covers.openlibrary.org/b/isbn/9780593318171-L.jpg', 4.3, 89, FALSE),

(8, 3, 'Astrophysics for People in a Hurry', 'Neil deGrasse Tyson', '9780393609394', 'What is the nature of space and time? How do we fit within the universe? Neil deGrasse Tyson brings the universe down to Earth succinctly and clearly.', 18.95, 14.99, 30, 'https://covers.openlibrary.org/b/isbn/9780393609394-L.jpg', 4.7, 150, TRUE),
(9, 3, 'A Brief History of Time', 'Stephen Hawking', '9780553380163', 'A landmark volume in science writing by one of the greatest minds of our time exploring the origins and fate of the universe.', 22.00, 17.50, 22, 'https://covers.openlibrary.org/b/isbn/9780553380163-L.jpg', 4.8, 290, FALSE),

(10, 4, 'Atomic Habits: An Easy & Proven Way to Build Good Habits', 'James Clear', '9780735211292', 'No matter your goals, Atomic Habits offers a proven framework for improving--every day. Learn how tiny changes can lead to remarkable results.', 27.00, 19.99, 60, 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg', 4.9, 580, TRUE),
(11, 4, 'The Psychology of Money', 'Morgan Housel', '9780857197689', 'Doing well with money isn’t necessarily about what you know. It’s about how you behave. Timeless lessons on wealth, greed, and happiness.', 24.95, 18.50, 45, 'https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg', 4.8, 310, TRUE),
(12, 4, 'Zero to One: Notes on Startups, or How to Build the Future', 'Peter Thiel, Blake Masters', '9780804139298', 'The great secret of our time is that there are still uncharted frontiers to explore and new inventions to create.', 25.00, 20.00, 25, 'https://covers.openlibrary.org/b/isbn/9780804139298-L.jpg', 4.5, 115, FALSE),

(13, 5, 'Thinking, Fast and Slow', 'Daniel Kahneman', '9780374533557', 'In the international bestseller, Daniel Kahneman, the renowned psychologist and winner of the Nobel Prize in Economics, takes us on a groundbreaking tour of the mind.', 22.99, 17.99, 32, 'https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg', 4.6, 215, FALSE),
(14, 5, 'Deep Work: Rules for Focused Success in a Distracted World', 'Cal Newport', '9781455586691', 'Deep work is the ability to focus without distraction on a cognitively demanding task. It''s a skill that allows you to quickly master complicated information.', 28.00, 21.99, 38, 'https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg', 4.7, 190, TRUE);
