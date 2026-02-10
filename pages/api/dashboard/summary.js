import db from "@/lib/db";

function fiscalYearRange(year) {
  // year = ปี พ.ศ. เช่น 2568
  // ปีงบประมาณ 2568 = 1 ต.ค. 2567 → 30 ก.ย. 2568
  const start = new Date(year - 544, 9, 1);
  const end = new Date(year - 543, 8, 30);
  return { start, end };
}

export default async function handler(req, res) {
  try {
    const { fiscalYear, groupBy = "type", department, group_name } = req.query;
    let whereParts = ["tr.checked LIKE ?"];
    let params = ["%ตรวจสอบแล้ว%"];

    if (fiscalYear) {
      const { start, end } = fiscalYearRange(parseInt(fiscalYear, 10));
      whereParts.push("tr.startDate BETWEEN ? AND ?");
      params.push(start.toISOString().slice(0, 10), end.toISOString().slice(0, 10));
    }

    // เพิ่มเงื่อนไข department ถ้ามี
    if (department) {
      whereParts.push("u.department = ?");
      params.push(department);
    }

    // เพิ่มเงื่อนไข group_name ถ้ามี
    if (group_name) {
      whereParts.push("u.group_name = ?");
      params.push(group_name);
    }

    const whereClause = "WHERE " + whereParts.join(" AND ");

    // whitelist เพื่อกัน SQL injection
    const allowedGroupBy = ["type", "position", "level", "department"];
    const groupField = allowedGroupBy.includes(groupBy) ? groupBy : "type";

    // สร้าง JOIN clause ถ้ามีการ filter ตาม department หรือ group_name
    const joinClause = (department || group_name) ? " JOIN users u ON tr.username = u.username" : "";

    const [users] = await db.query(
      `SELECT COUNT(DISTINCT tr.username) AS total_users 
       FROM training_reports tr${joinClause} ${whereClause}`,
      params
    );

    const [reports] = await db.query(
      `SELECT COUNT(*) AS total_reports 
       FROM training_reports tr${joinClause} ${whereClause}`,
      params
    );

    const [avg] = await db.query(
      `SELECT ROUND(COUNT(*) / COUNT(DISTINCT tr.username), 2) AS avg_reports_per_user
       FROM training_reports tr${joinClause} ${whereClause}`,
      params
    );

    const [byGroup] = await db.query(
      `SELECT u.${groupField} AS groupField, 
              COUNT(DISTINCT tr.username) AS total_users, 
              COUNT(*) AS total_reports
       FROM training_reports tr
       JOIN users u ON tr.username = u.username
       ${whereClause}
       GROUP BY u.${groupField}`,
      params
    );

    // 🔥 Top 10 ผู้ส่งรายงานเยอะที่สุด
    const [rankingTop10] = await db.query(
      `SELECT 
          CONCAT(
            u.title, ' ', u.first_name, ' ', u.last_name, '\t\t',
            IFNULL(u.type,''), '\t\t',
            IFNULL(u.position,''), ' ',  IFNULL(u.level,''), '\t\t',
            IFNULL(u.department,'')
          ) AS full_name,
          COUNT(*) AS total_reports
       FROM training_reports tr
       JOIN users u ON tr.username = u.username
       ${whereClause}
       GROUP BY u.username
       ORDER BY total_reports DESC
       LIMIT 10`,
      params
    );

    res.json({
      total_users: users[0].total_users,
      total_reports: reports[0].total_reports,
      avg_reports_per_user: avg[0].avg_reports_per_user,
      byType: byGroup,
      rankingTop10, // ✅ ใช้ตัวแปรที่ประกาศจริง
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
