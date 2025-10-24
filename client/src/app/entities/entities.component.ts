import { defineComponent, provide } from 'vue';

import PeriodService from './period/period.service';
import UmService from './um/um.service';
import UserService from '@/entities/user/user.service';
// jhipster-needle-add-entity-service-to-entities-component-import - JHipster will import entities services here

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Entities',
  setup() {
    provide('userService', () => new UserService());
    provide('periodService', () => new PeriodService());
    provide('umService', () => new UmService());
    // jhipster-needle-add-entity-service-to-entities-component - JHipster will import entities services here
  },
});
