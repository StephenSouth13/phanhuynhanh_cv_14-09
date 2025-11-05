<?php
declare(strict_types=1);

use MongoDB\Client;
use MongoDB\Database;
use MongoDB\Collection;

class MongoDBHelper {
    private static ?Client $client = null;
    private static ?Database $database = null;

    public static function getClient(): Client {
        if (self::$client === null) {
            $uri = getenv('MONGODB_URI');
            if (!$uri) {
                throw new RuntimeException('MONGODB_URI environment variable is not set');
            }
            self::$client = new Client($uri);
        }
        return self::$client;
    }

    public static function getDatabase(): Database {
        if (self::$database === null) {
            $dbName = getenv('MONGODB_DATABASE');
            if (!$dbName) {
                throw new RuntimeException('MONGODB_DATABASE environment variable is not set');
            }
            self::$database = self::getClient()->selectDatabase($dbName);
        }
        return self::$database;
    }

    public static function collection(string $name): Collection {
        return self::getDatabase()->selectCollection($name);
    }

    public static function initializeCollections(): void {
        $db = self::getDatabase();
        
        $collections = ['users', 'messages', 'home', 'about', 'resume', 'portfolio', 'services', 'contact', 'contacts'];
        foreach ($collections as $collName) {
            try {
                $db->createCollection($collName);
            } catch (\Exception $e) {
                // Collection already exists, this is fine
            }
        }

        // Initialize default admin user if none exists
        $users = self::collection('users');
        if ($users->countDocuments() === 0) {
            $users->insertOne([
                'email' => 'admin@example.com',
                'passwordHash' => password_hash('admin123', PASSWORD_DEFAULT),
                'name' => 'Administrator',
                'avatar' => '',
                'createdAt' => new \MongoDB\BSON\UTCDateTime()
            ]);
        }

        // Initialize default home page content if not exists
        $home = self::collection('home');
        if ($home->countDocuments() === 0) {
            $home->insertOne([
                'heading' => 'Phan Huỳnh Anh',
                'subtitle' => 'coaching cho sinh viên cùng bạn trẻ khởi nghiệp',
                'bannerImage' => 'assets/img/hero.jpg',
                'createdAt' => new \MongoDB\BSON\UTCDateTime(),
                'updatedAt' => new \MongoDB\BSON\UTCDateTime()
            ]);
        }
    }
}
