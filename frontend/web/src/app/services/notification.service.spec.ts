import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
  });

  it('should emit success notifications', (done) => {
    service.notifications$.subscribe((notification) => {
      expect(notification.level).toBe('success');
      expect(notification.message).toBe('OK');
      done();
    });

    service.success('OK');
  });

  it('should emit error notifications', (done) => {
    service.notifications$.subscribe((notification) => {
      expect(notification.level).toBe('error');
      expect(notification.message).toBe('Oops');
      done();
    });

    service.error('Oops');
  });
});
