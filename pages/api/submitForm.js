// pages/api/submitForm.js
import * as Sentry from '@sentry/nextjs';
import TrainingReport from '../../models/TrainingReport';
import pool from '../../lib/db';
import {
  attachSessionUserContext,
  sanitizeErrorForLog,
  withBusinessSpan,
} from '../../lib/sentry';

export default async (req, res) => {
  attachSessionUserContext(req, { username: req.body?.username });

  if (req.method === 'POST') {
    const startedAt = Date.now();
    try {
      const reportData = req.body;
      // เพิ่ม submitTime เป็นเวลาปัจจุบัน
      reportData.submitTime = new Date();
      const hasNote = Boolean(reportData.note && reportData.note.trim() !== '');

      const result = await withBusinessSpan(
        'submit_form.process',
        'form.submit',
        {
          'submit_form.has_note': hasNote,
          'report.has_certificate': Boolean(reportData.certificate_url),
          'report.has_approval_doc': Boolean(reportData.approvalDocument),
          'report.has_training_project_doc': Boolean(reportData.trainingProjectDocument),
        },
        async (span) => {
          const saved = await TrainingReport.addReport(reportData);
          span.setAttribute('form_code', saved.formCode);

          if (hasNote) {
            await withBusinessSpan(
              'submit_form.create_note_notification',
              'db.notification',
              { form_code: saved.formCode },
              async () => {
                await pool.query(
                  'INSERT INTO note_notifications (reportId, formCode, note) VALUES (?, ?, ?)',
                  [saved.id, saved.formCode, reportData.note]
                );
              }
            );
          }

          return saved;
        }
      );

      Sentry.logger.info('Training report submitted', {
        form_code: result.formCode,
        has_note: hasNote,
        has_certificate: Boolean(reportData.certificate_url),
        has_approval_doc: Boolean(reportData.approvalDocument),
        duration_ms: Date.now() - startedAt,
        status: 'success',
        http_status: 200,
      });

      res.status(200).json({ message: 'Data saved successfully', formCode: result.formCode });
    } catch (error) {
      const safeErr = sanitizeErrorForLog(error);
      Sentry.logger.error('Training report submission failed', {
        duration_ms: Date.now() - startedAt,
        status: 'error',
        http_status: 500,
        ...safeErr,
      });
      Sentry.captureException(error);
      console.error(safeErr.error_message);
      res.status(500).json({ message: 'Database error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
