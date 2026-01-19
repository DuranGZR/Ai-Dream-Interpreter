/**
 * Analytics Service
 * Event tracking ve kullanıcı davranış analizi
 */

interface AnalyticsEvent {
  name: string;
  params?: Record<string, any>;
  timestamp: string;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private sessionStart: Date = new Date();

  // Event tracking
  logEvent(eventName: string, params?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name: eventName,
      params,
      timestamp: new Date().toISOString(),
    };

    this.events.push(event);
    console.log('📊 Analytics Event:', eventName, params);

    // Gelecekte Firebase Analytics veya başka bir servise gönderilebilir
    this.sendToBackend(event);
  }

  // Ekran görüntüleme
  logScreenView(screenName: string) {
    this.logEvent('screen_view', {
      screen_name: screenName,
      screen_class: screenName,
    });
  }

  // Rüya oluşturma
  logDreamCreated(dreamLength: number, energy: number) {
    this.logEvent('dream_created', {
      dream_length: dreamLength,
      energy_level: energy,
      energy_category: this.getEnergyCategory(energy),
    });
  }

  // Rüya kaydetme
  logDreamSaved(dreamId: string, energy: number) {
    this.logEvent('dream_saved', {
      dream_id: dreamId,
      energy_level: energy,
    });
  }

  // Rüya silme
  logDreamDeleted(dreamId: string) {
    this.logEvent('dream_deleted', {
      dream_id: dreamId,
    });
  }

  // Favori toggle
  logFavoriteToggled(dreamId: string, isFavorite: boolean) {
    this.logEvent('favorite_toggled', {
      dream_id: dreamId,
      is_favorite: isFavorite,
    });
  }

  // Paylaşım
  logShare(shareType: 'general' | 'whatsapp' | 'instagram' | 'pdf', success: boolean) {
    this.logEvent('dream_shared', {
      share_type: shareType,
      success,
    });
  }

  // Profil görüntüleme
  logProfileView(userId: string) {
    this.logEvent('profile_viewed', {
      user_id: userId,
    });
  }

  // Arama yapma
  logSearch(query: string, resultsCount: number) {
    this.logEvent('search_performed', {
      query_length: query.length,
      results_count: resultsCount,
    });
  }

  // Filtre kullanımı
  logFilterUsed(filterType: string, filterValue: string) {
    this.logEvent('filter_used', {
      filter_type: filterType,
      filter_value: filterValue,
    });
  }

  // Session süresi
  getSessionDuration(): number {
    return Date.now() - this.sessionStart.getTime();
  }

  // Session bitişi
  logSessionEnd() {
    const duration = this.getSessionDuration();
    this.logEvent('session_end', {
      duration_ms: duration,
      duration_min: Math.round(duration / 60000),
      events_count: this.events.length,
    });
  }

  // Helper: Enerji kategorisi
  private getEnergyCategory(energy: number): string {
    if (energy < 40) return 'low';
    if (energy < 70) return 'medium';
    return 'high';
  }

  // Backend'e gönderme (gelecekte implement edilebilir)
  private async sendToBackend(event: AnalyticsEvent) {
    // Şimdilik sadece console'a log
    // Gelecekte:
    // await fetch('/api/analytics', {
    //   method: 'POST',
    //   body: JSON.stringify(event)
    // });
  }

  // İstatistikler
  getStats() {
    return {
      totalEvents: this.events.length,
      sessionDuration: this.getSessionDuration(),
      eventsByType: this.events.reduce((acc, event) => {
        acc[event.name] = (acc[event.name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  // Event geçmişini temizle
  clearEvents() {
    this.events = [];
    console.log('🗑️ Analytics events cleared');
  }
}

// Singleton instance
export const Analytics = new AnalyticsService();
