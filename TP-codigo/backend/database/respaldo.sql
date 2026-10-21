-- MySQL dump 10.13  Distrib 26.7.0, for Win64 (x86_64)
--
-- Host: localhost    Database: gestion_turnos
-- ------------------------------------------------------
-- Server version	26.7.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '7a0cf68f-92de-11f1-b126-7085c2be01a8:1-350';

--
-- Table structure for table `administrador`
--

DROP TABLE IF EXISTS `administrador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administrador` (
  `idAdministrador` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `nombreUsuario` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  PRIMARY KEY (`idAdministrador`),
  UNIQUE KEY `nombreUsuario` (`nombreUsuario`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `administrador`
--

LOCK TABLES `administrador` WRITE;
/*!40000 ALTER TABLE `administrador` DISABLE KEYS */;
INSERT INTO `administrador` VALUES (1,'Administrador Principal','admin','$2b$10$.YrSugcuGFo/ex6M9.j1f.W5wc1kldwO87pIBV//3EvLMFqKq6YX6');
/*!40000 ALTER TABLE `administrador` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `atencion`
--

DROP TABLE IF EXISTS `atencion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `atencion` (
  `idAtencion` int NOT NULL AUTO_INCREMENT,
  `fechaAtencion` date NOT NULL,
  `horaAtencion` time NOT NULL,
  `nroIngreso` int NOT NULL,
  `idPaciente` int NOT NULL,
  `matricula` int NOT NULL,
  `idDiagnostico` int DEFAULT NULL,
  `idTipo` int DEFAULT NULL,
  `estado` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`idAtencion`),
  KEY `idPaciente` (`idPaciente`),
  KEY `matricula` (`matricula`),
  KEY `idDiagnostico` (`idDiagnostico`),
  KEY `idTipo` (`idTipo`),
  CONSTRAINT `atencion_ibfk_1` FOREIGN KEY (`idPaciente`) REFERENCES `paciente` (`idPaciente`),
  CONSTRAINT `atencion_ibfk_2` FOREIGN KEY (`matricula`) REFERENCES `medico` (`matricula`),
  CONSTRAINT `atencion_ibfk_3` FOREIGN KEY (`idDiagnostico`) REFERENCES `diagnostico` (`idDiagnostico`),
  CONSTRAINT `atencion_ibfk_4` FOREIGN KEY (`idTipo`) REFERENCES `tipourgencia` (`idTipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `atencion`
--

LOCK TABLES `atencion` WRITE;
/*!40000 ALTER TABLE `atencion` DISABLE KEYS */;
/*!40000 ALTER TABLE `atencion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diagnostico`
--

DROP TABLE IF EXISTS `diagnostico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diagnostico` (
  `idDiagnostico` int NOT NULL AUTO_INCREMENT,
  `nombreDiagnostico` varchar(100) NOT NULL,
  `tratamiento` varchar(300) NOT NULL,
  PRIMARY KEY (`idDiagnostico`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diagnostico`
--

LOCK TABLES `diagnostico` WRITE;
/*!40000 ALTER TABLE `diagnostico` DISABLE KEYS */;
/*!40000 ALTER TABLE `diagnostico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `especialidad`
--

DROP TABLE IF EXISTS `especialidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `especialidad` (
  `idEspecialidad` int NOT NULL AUTO_INCREMENT,
  `nombreEspecialidad` varchar(50) NOT NULL,
  `descripcion` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`idEspecialidad`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `especialidad`
--

LOCK TABLES `especialidad` WRITE;
/*!40000 ALTER TABLE `especialidad` DISABLE KEYS */;
INSERT INTO `especialidad` VALUES (1,'infectologia','Especialidad en enfermedades infecciosas'),(2,'Cardiologia','Especialidad en enfermedades del corazón'),(3,'oncología','Especialidad en enfermedades oncológicas'),(4,'Neurologia','Especialidad en enfermedades del sistema nervioso');
/*!40000 ALTER TABLE `especialidad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medico`
--

DROP TABLE IF EXISTS `medico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medico` (
  `matricula` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `nombreUsuario` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `idEspecialidad` int DEFAULT NULL,
  PRIMARY KEY (`matricula`),
  UNIQUE KEY `nombreUsuario` (`nombreUsuario`),
  KEY `idEspecialidad` (`idEspecialidad`),
  CONSTRAINT `medico_ibfk_1` FOREIGN KEY (`idEspecialidad`) REFERENCES `especialidad` (`idEspecialidad`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medico`
--

LOCK TABLES `medico` WRITE;
/*!40000 ALTER TABLE `medico` DISABLE KEYS */;
INSERT INTO `medico` VALUES (1,'Gregory','House','drHouse','$2b$10$9iNyBYtBrN4iFGVdZqR04.maDi7cOiTFNXWCb3TO6Q4vNBOwKyK16',1),(2,'Stephen','Strange','drStrange','$2b$10$vQQyT3YUSg.N9AW6EIpo.u4cKk6ctNk5Lb/nZD.xScypx0aBmJdZy',4),(3,'Meredith','Grey','drGrey','$2b$10$rcKPAiOZnWZrJpOtkmUkxOgavB.CiWBc.Pdf8ba3C/mStxGdk2cee',4),(4,'John','Watson','drWatson','$2b$10$ZH0VwxGYxQqb.U1gaz.Xmu7yZ1toPcTtEXq33FR9UKq9R9ykWCcmK',2),(5,'James','Wilson','drWilson','$2b$10$0/JdiMAT4ZPsJM5r0KBOLObpR88ix0Vkh7coN/Jqr7V2xwhWrooTO',3);
/*!40000 ALTER TABLE `medico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `obrasocial`
--

DROP TABLE IF EXISTS `obrasocial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `obrasocial` (
  `idObra` int NOT NULL AUTO_INCREMENT,
  `nombreObra` varchar(100) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  PRIMARY KEY (`idObra`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `obrasocial`
--

LOCK TABLES `obrasocial` WRITE;
/*!40000 ALTER TABLE `obrasocial` DISABLE KEYS */;
INSERT INTO `obrasocial` VALUES (1,'Previnca',1200.00),(2,'OSDE',1500.00),(3,'Swiss Medical',2000.00),(4,'Medife',1800.00),(5,'Sancor Salud',1400.00);
/*!40000 ALTER TABLE `obrasocial` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paciente`
--

DROP TABLE IF EXISTS `paciente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paciente` (
  `idPaciente` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `dni` varchar(20) NOT NULL,
  `nombreUsuario` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `idObra` int DEFAULT NULL,
  PRIMARY KEY (`idPaciente`),
  UNIQUE KEY `nombreUsuario` (`nombreUsuario`),
  KEY `idObra` (`idObra`),
  CONSTRAINT `paciente_ibfk_1` FOREIGN KEY (`idObra`) REFERENCES `obrasocial` (`idObra`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paciente`
--

LOCK TABLES `paciente` WRITE;
/*!40000 ALTER TABLE `paciente` DISABLE KEYS */;
INSERT INTO `paciente` VALUES (1,'Juan','Perez','47076568','user1','$2b$10$YqFGuSQnlvQmch2kOKz1lumPu8ZfMgJAD2ruIgsI7vjyxa4J2ch9m',1),(2,'Marcelo','Tinelli','7248513','user2','$2b$10$7taHtidcGbk9jg0Y.wa6JeaCpnOgxogE9d8iW4qnGTxNEGx17/5ny',NULL),(3,'Roberto','Musso',' 7915420','user3','$2b$10$gwcdgIKl7Lg6Uf.TlJx8BeXfCqGTnKGbk/tSNRZBUIyOHAp6CLZnu',2),(4,'Juanito','Alcachofa','39135893','user4','$2b$10$1kQu1.nNvu.vqTuxz2Dos.QFM/3BchgnsldSrF7GGLdCMn9FaX5Aq',3),(5,'Tim','Payne','26156284','user5','$2b$10$D5yfTkG0Xyasj54vTLtWKeE9QQ1FGZEaS/YH1BynN7obnb/tiMnnm',4),(6,'Thomas ','Holland','39641855','user6','$2b$10$omN1UA/Zl0hUBRhD4GZ9kurwXswjpIH0eJ16urkt5rf9iH31HS2gK',2),(7,'Stanley','Pines','20154984','user7','$2b$10$KB2XKhqDreFzleEfm9dxZO8pZwWVY0cCEblEfd9kwsjqs/ftl6kfC',NULL);
/*!40000 ALTER TABLE `paciente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipourgencia`
--

DROP TABLE IF EXISTS `tipourgencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipourgencia` (
  `idTipo` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcionTipo` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idTipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipourgencia`
--

LOCK TABLES `tipourgencia` WRITE;
/*!40000 ALTER TABLE `tipourgencia` DISABLE KEYS */;
/*!40000 ALTER TABLE `tipourgencia` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-20 21:29:16
