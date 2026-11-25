// controllers/reportsController.js
import * as Sentry from '@sentry/nextjs';
import pool from '../lib/db.js';
import {
    attachSessionUserContext,
    sanitizeErrorForLog,
    withBusinessSpan,
} from '../lib/sentry';

const getReports = async (req, res) => {
    const startedAt = Date.now();
    attachSessionUserContext(req);

    const filterPresent = Object.keys(req.query || {}).length > 0;

    try {
        const rows = await withBusinessSpan(
            'reports.fetch_all',
            'db.reports',
            { 'reports.filter_present': filterPresent },
            async (span) => {
                const [resultRows] = await pool.query(`
    SELECT 
        tr.*, 
        u.id AS user_id,
        u.nickname,
        CONCAT(u.first_name, ' ', u.last_name) AS full_name,
        u.email,
        u.first_name,
        u.last_name,
        u.phone_number,
        u.position,
        u.level,
        u.department,
        u.group_name,
        u.under_department1,
        u.under_department2,
        u.created_at,
        u.status,
        u.type,
        u.title,
        ue.nickname AS whoEdit_nickname
    FROM 
        training_reports tr
    JOIN 
        users u 
      ON tr.username = u.username
    LEFT JOIN 
        users ue
      ON tr.whoEdit = ue.username
`);
                span.setAttribute('reports.count', resultRows.length);
                return resultRows;
            }
        );

        await withBusinessSpan(
            'reports.serialize_response',
            'serialize.json',
            {
                'reports.count': rows.length,
                'reports.filter_present': filterPresent,
            },
            () => {
                res.status(200).json(rows);
            }
        );
    } catch (error) {
        const safeErr = sanitizeErrorForLog(error);
        Sentry.logger.error('Failed to fetch reports', {
            duration_ms: Date.now() - startedAt,
            filter_present: filterPresent,
            status: 'error',
            ...safeErr,
        });
        Sentry.captureException(error);
        console.error('Error fetching reports:', safeErr.error_message);
        res.status(500).json({ message: 'Error fetching reports' });
    }
};


const deleteReport = async (req, res) => {
    const startedAt = Date.now();
    attachSessionUserContext(req);

    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ message: 'Missing report ID' });
    }

    try {
        const affectedRows = await withBusinessSpan(
            'reports.delete',
            'db.reports',
            {},
            async (span) => {
                const result = await pool.query('DELETE FROM training_reports WHERE id = ?', [id]);
                const deletedCount = result[0].affectedRows;
                span.setAttributes({
                    'db.affected_rows': deletedCount,
                    'report.deleted': deletedCount > 0,
                });
                return deletedCount;
            }
        );

        if (affectedRows === 0) {
            Sentry.logger.warn('Report delete target not found', {
                duration_ms: Date.now() - startedAt,
                status: 'not_found',
                http_status: 404,
            });
            return res.status(404).json({ message: 'Report not found' });
        }

        Sentry.logger.info('Training report deleted', {
            duration_ms: Date.now() - startedAt,
            affected_rows: affectedRows,
            status: 'success',
            http_status: 200,
        });
        res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error) {
        const safeErr = sanitizeErrorForLog(error);
        Sentry.logger.error('Failed to delete report', {
            duration_ms: Date.now() - startedAt,
            status: 'error',
            ...safeErr,
        });
        Sentry.captureException(error);
        console.error('Error deleting report:', safeErr.error_message);
        res.status(500).json({ message: 'Error deleting report' });
    }
};




const markAllAsRead = async (req, res) => {
    try {
        const result = await pool.query('UPDATE training_reports SET isRead = ?', [true]);
        res.status(200).json({ message: 'All reports marked as read', affectedRows: result[0].affectedRows });
    } catch (error) {
        console.error('Error marking all reports as read:', error);
        res.status(500).json({ message: 'Error marking all reports as read' });
    }
};

export default { getReports, deleteReport, markAllAsRead };

