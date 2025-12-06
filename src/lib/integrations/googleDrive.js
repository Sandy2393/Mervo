/*
 * Google Drive Integration Placeholder
 * Client-side helper that calls server-side endpoints to perform actual Drive API work.
 * OAuth2 / service account usage must be done server-side.
 */
export async function exportCompanyReportsToDrive(companyId, dateRange) {
    // TODO: Implement server-side endpoint at /api/integrations/google-drive/export
    // The server should perform OAuth2 flow / service account usage and upload ZIP/CSV to Drive.
    // This client method should call that endpoint and return the operation status.
    const res = await fetch(`/api/integrations/google-drive/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, dateRange })
    });
    if (!res.ok) {
        throw new Error('Export failed');
    }
    return res.json();
}
export default { exportCompanyReportsToDrive };
