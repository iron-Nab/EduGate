import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Wifi, WifiOff, Palette, Database, Download, Upload, Trash2, Check, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { toast } from '../components/ui/Toast';
import { useSettingsStore } from '../stores/settings-store';
import { useGateway } from '../hooks/use-gateway';
import { db } from '../db';
import type { Language, Theme } from '../types/settings';

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { gatewayUrl, apiKey, connectionStatus, connectionError, theme, language, setGatewayUrl, setApiKey, setTheme, setLanguage } = useSettingsStore();
  const { testConnection } = useGateway();
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    try {
      await testConnection();
      toast(t('settings.connected'), 'success');
    } catch {
      toast(t('settings.disconnected'), 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleLangChange = (lang: Language) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const handleExport = async () => {
    const data = {
      buildings: await db.buildings.toArray(),
      rooms: await db.rooms.toArray(),
      departments: await db.departments.toArray(),
      programs: await db.programs.toArray(),
      courses: await db.courses.toArray(),
      instructors: await db.instructors.toArray(),
      studentGroups: await db.studentGroups.toArray(),
      timeSlots: await db.timeSlots.toArray(),
      semesters: await db.semesters.toArray(),
      scheduleEntries: await db.scheduleEntries.toArray(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edugate-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Donnees exportees', 'success');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.buildings) await db.buildings.bulkPut(data.buildings);
        if (data.rooms) await db.rooms.bulkPut(data.rooms);
        if (data.departments) await db.departments.bulkPut(data.departments);
        if (data.programs) await db.programs.bulkPut(data.programs);
        if (data.courses) await db.courses.bulkPut(data.courses);
        if (data.instructors) await db.instructors.bulkPut(data.instructors);
        if (data.studentGroups) await db.studentGroups.bulkPut(data.studentGroups);
        if (data.timeSlots) await db.timeSlots.bulkPut(data.timeSlots);
        if (data.semesters) await db.semesters.bulkPut(data.semesters);
        if (data.scheduleEntries) await db.scheduleEntries.bulkPut(data.scheduleEntries);
        toast('Donnees importees', 'success');
      } catch {
        toast('Erreur import', 'error');
      }
    };
    input.click();
  };

  const handleClear = async () => {
    if (!confirm(t('settings.clearConfirm'))) return;
    await Promise.all([
      db.buildings.clear(),
      db.rooms.clear(),
      db.departments.clear(),
      db.programs.clear(),
      db.courses.clear(),
      db.instructors.clear(),
      db.studentGroups.clear(),
      db.timeSlots.clear(),
      db.semesters.clear(),
      db.scheduleEntries.clear(),
      db.chatSessions.clear(),
      db.chatMessages.clear(),
    ]);
    toast('Donnees effacees', 'success');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Settings className="w-6 h-6" />
        {t('settings.title')}
      </h1>

      {/* Gateway */}
      <Card>
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          {connectionStatus === 'ok' ? <Wifi className="w-5 h-5 text-success" /> : <WifiOff className="w-5 h-5 text-text-muted" />}
          {t('settings.gateway')}
        </h2>
        <div className="space-y-3">
          <Input
            label={t('settings.gatewayUrl')}
            value={gatewayUrl}
            onChange={(e) => setGatewayUrl(e.target.value)}
            placeholder={t('settings.gatewayUrlPlaceholder')}
          />
          <Input
            label={t('settings.apiKey')}
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={t('settings.apiKeyPlaceholder')}
          />
          <div className="flex items-center gap-3">
            <Button onClick={handleTest} size="sm" variant="secondary" disabled={testing || !gatewayUrl}>
              {testing ? '...' : t('settings.testConnection')}
            </Button>
            <Badge variant={connectionStatus === 'ok' ? 'success' : connectionStatus === 'error' ? 'danger' : 'default'}>
              {connectionStatus === 'ok' && <><Check className="w-3 h-3 mr-1" />{t('settings.connected')}</>}
              {connectionStatus === 'error' && <><X className="w-3 h-3 mr-1" />{t('settings.disconnected')}</>}
              {connectionStatus === 'untested' && 'Non teste'}
            </Badge>
          </div>
          {connectionError && <p className="text-xs text-danger">{connectionError}</p>}
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          {t('settings.appearance')}
        </h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-text-secondary mb-2">{t('settings.theme')}</p>
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as Theme[]).map((th) => (
                <Button key={th} variant={theme === th ? 'primary' : 'secondary'} size="sm" onClick={() => setTheme(th)}>
                  {t(`settings.${th}`)}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-text-secondary mb-2">{t('settings.language')}</p>
            <div className="flex gap-2">
              {([{ v: 'fr', l: 'Francais' }, { v: 'en', l: 'English' }, { v: 'ar', l: 'العربية' }] as { v: Language; l: string }[]).map((lng) => (
                <Button key={lng.v} variant={language === lng.v ? 'primary' : 'secondary'} size="sm" onClick={() => handleLangChange(lng.v)}>
                  {lng.l}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card>
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          {t('settings.data')}
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4" />
            {t('settings.exportAll')}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleImport}>
            <Upload className="w-4 h-4" />
            {t('settings.importData')}
          </Button>
          <Button variant="danger" size="sm" onClick={handleClear}>
            <Trash2 className="w-4 h-4" />
            {t('settings.clearAll')}
          </Button>
        </div>
      </Card>

      <p className="text-xs text-text-muted text-center">EduGate v1.0.0</p>
    </div>
  );
}
