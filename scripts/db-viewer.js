// scripts/db-viewer.js
const mysql = require('mysql2/promise');

async function viewDatabase() {
  let connection;

  try {
    // DB 연결
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'tkdgur203@',
      database: 'humanpower'
    });

    console.log('✅ humanpower DB에 연결되었습니다!\n');

    // 테이블 목록 조회
    console.log('📋 테이블 목록:');
    console.log('─'.repeat(50));
    const [tables] = await connection.query('SHOW TABLES');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`${index + 1}. ${tableName}`);
    });
    console.log('');

    // 각 테이블의 데이터 수 조회
    console.log('📊 각 테이블의 데이터 수:');
    console.log('─'.repeat(50));
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      const [result] = await connection.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
      console.log(`${tableName}: ${result[0].count}개`);
    }
    console.log('');

    // 각 테이블의 구조 및 샘플 데이터 조회
    for (const table of tables) {
      const tableName = Object.values(table)[0];

      console.log(`\n📌 테이블: ${tableName}`);
      console.log('═'.repeat(50));

      // 테이블 구조
      const [columns] = await connection.query(`DESCRIBE \`${tableName}\``);
      console.log('\n컬럼 구조:');
      columns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type}) ${col.Key === 'PRI' ? '🔑' : ''} ${col.Null === 'NO' ? 'NOT NULL' : ''}`);
      });

      // 샘플 데이터 (최대 5개)
      const [rows] = await connection.query(`SELECT * FROM \`${tableName}\` LIMIT 5`);
      if (rows.length > 0) {
        console.log(`\n샘플 데이터 (최대 5개):`);
        console.log(JSON.stringify(rows, null, 2));
      } else {
        console.log('\n데이터 없음');
      }
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ DB 연결 종료');
    }
  }
}

viewDatabase();
