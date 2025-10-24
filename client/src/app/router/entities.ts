import { Authority } from '@/shared/security/authority';
const Entities = () => import('@/entities/entities.vue');

const Period = () => import('@/entities/period/period.vue');
const PeriodUpdate = () => import('@/entities/period/period-update.vue');

const Um = () => import('@/entities/um/um.vue');
const UmUpdate = () => import('@/entities/um/um-update.vue');

// jhipster-needle-add-entity-to-router-import - JHipster will import entities to the router here

export default {
  path: '/',
  component: Entities,
  children: [
    {
      path: 'period',
      name: 'Period',
      component: Period,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'period/new',
      name: 'PeriodCreate',
      component: PeriodUpdate,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'um',
      name: 'Um',
      component: Um,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'um/new',
      name: 'UmCreate',
      component: UmUpdate,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'um/:umId/edit',
      name: 'UmEdit',
      component: UmUpdate,
      meta: { authorities: [Authority.USER] },
    },
    // jhipster-needle-add-entity-to-router - JHipster will add entities to the router here
  ],
};
