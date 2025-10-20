import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import PeriodUpdate from './period-update.vue';
import PeriodService from './period.service';
import AlertService from '@/shared/alert/alert.service';

type PeriodUpdateComponentType = InstanceType<typeof PeriodUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const periodSample = { id: 123 };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<PeriodUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('Period Management Update Component', () => {
    let comp: PeriodUpdateComponentType;
    let periodServiceStub: SinonStubbedInstance<PeriodService>;

    beforeEach(() => {
      route = {};
      periodServiceStub = sinon.createStubInstance<PeriodService>(PeriodService);
      periodServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

      alertService = new AlertService({
        i18n: { t: vitest.fn() } as any,
        bvToast: {
          toast: vitest.fn(),
        } as any,
      });

      mountOptions = {
        stubs: {
          'font-awesome-icon': true,
          'b-input-group': true,
          'b-input-group-prepend': true,
          'b-form-datepicker': true,
          'b-form-input': true,
        },
        provide: {
          alertService,
          periodService: () => periodServiceStub,
        },
      };
    });

    afterEach(() => {
      vitest.resetAllMocks();
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', async () => {
        // GIVEN
        const wrapper = shallowMount(PeriodUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.period = periodSample;
        periodServiceStub.update.resolves(periodSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(periodServiceStub.update.calledWith(periodSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        periodServiceStub.create.resolves(entity);
        const wrapper = shallowMount(PeriodUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.period = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(periodServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        periodServiceStub.find.resolves(periodSample);
        periodServiceStub.retrieve.resolves([periodSample]);

        // WHEN
        route = {
          params: {
            periodId: `${periodSample.id}`,
          },
        };
        const wrapper = shallowMount(PeriodUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.period).toMatchObject(periodSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        periodServiceStub.find.resolves(periodSample);
        const wrapper = shallowMount(PeriodUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
