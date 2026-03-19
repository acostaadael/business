<script setup lang="ts">
import { type Ref, onMounted, ref, watch, defineProps, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { debounce } from 'lodash';
import type { CrudTableActionType, CrudTableEntity, CrudTableService } from './crud-table-interface';

const { t: t$ } = useI18n();

const props = defineProps<{
  entity: CrudTableEntity;
  service: CrudTableService<any>;
}>();

const itemsPerPage = ref(20);
const queryCount: Ref<number> = ref(0);
const page: Ref<number> = ref(1);
const propOrder = ref<string>('id');
const reverse = ref(false);
const totalItems = ref(0);
const searchText = ref('');
const items: Ref<any[]> = ref([]);
const isFetching = ref(false);

const clear = () => {
  page.value = 1;
};

const sort = (): Array<any> => {
  const result = [`${propOrder.value},${reverse.value ? 'desc' : 'asc'}`];
  if (propOrder.value !== 'id') {
    result.push('id');
  }
  return result;
};

const retrieveItems = async () => {
  isFetching.value = true;
  try {
    const paginationQuery =
      searchText.value == ''
        ? {
            page: page.value - 1,
            size: itemsPerPage.value,
            sort: sort(),
          }
        : {
            page: page.value - 1,
            size: itemsPerPage.value,
            globalSearch: searchText.value,
            sort: sort(),
          };
    const res = await props.service.retrieve(paginationQuery);
    totalItems.value = Number(res.headers['x-total-count'] || res.headers['X-Total-Count'] || 0);
    queryCount.value = totalItems.value;
    items.value = res.data;
  } catch (err: any) {
    console.error(err);
  } finally {
    isFetching.value = false;
  }
};

onMounted(async () => {
  await retrieveItems();
});

const removeId: Ref<number | string | null> = ref(null);
const removeEntity = ref<any>(null);
const prepareRemove = (instance: any) => {
  removeId.value = instance.id;
  removeEntity.value.show();
};
const closeDialog = () => {
  removeEntity.value.hide();
};
const removeItem = async () => {
  if (removeId.value === null || removeId.value === undefined) return;
  if (typeof removeId.value !== 'string' && typeof removeId.value !== 'number') return;
  try {
    await props.service.delete(removeId.value);
    removeId.value = null;
    retrieveItems();
    closeDialog();
  } catch (error: any) {
    console.error(error);
  }
};

const changeOrder = (newOrder: string) => {
  if (propOrder.value === newOrder) {
    reverse.value = !reverse.value;
  } else {
    reverse.value = false;
  }
  propOrder.value = newOrder;
};

// Whenever order changes, reset the pagination
watch([propOrder, reverse], async () => {
  if (page.value === 1) {
    await retrieveItems();
  } else {
    clear();
  }
});

// Whenever page changes, switch to the new page.
watch(page, async () => {
  await retrieveItems();
});

const onInput = debounce(async () => {
  await retrieveItems();
}, 500);

const actions = computed(() => props.entity.actions ?? []);
const hasAction = (type: CrudTableActionType['type']) => actions.value.some(a => a.type === type);
const action = (type: CrudTableActionType['type']) => actions.value.find(a => a.type === type);
const actionTo = (type: CrudTableActionType['type'], item: any) => {
  const a = action(type);
  if (!a?.routeName) return null;
  const params = a.params ? a.params(item) : { id: item.id };
  return { name: a.routeName, params };
};
</script>
<template>
  <div>
    <h2 id="page-heading" data-cy="ItemHeading">
      <span>{{ t$(props.entity.title) ?? '' }}</span>
      <div class="d-flex justify-content-end">
        <b-form-input
          class="mr-2"
          id="input-small"
          type="search"
          v-model="searchText"
          :style="{ width: 40 + 'ch' }"
          :placeholder="t$('entity.action.search')"
          @input="onInput"
        ></b-form-input>
        <slot name="create-button"></slot>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && items && items.length === 0">
      <span>{{ t$('entity.home.notFound') }}</span>
    </div>
    <div class="table-responsive" v-if="items && items.length > 0">
      <table class="table table-striped">
        <thead>
          <tr>
            <th v-for="col in entity.columns" :key="col.key" @click="col.sortable ? changeOrder(col.key) : null">
              <span>{{ t$(col.label) }}</span>
              <jhi-sort-indicator
                v-if="col.sortable"
                :current-order="propOrder"
                :reverse="reverse"
                :field-name="col.key"
              ></jhi-sort-indicator>
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td v-for="col in entity.columns" :key="col.key">
              <slot v-if="col.slot" :name="`cell-${col.key}`" :item="item">
                {{ item[col.key] }}
              </slot>
              <template v-else>
                <template v-if="col.render">
                  {{ col.render(item) }}
                </template>
                <template v-else>
                  {{ item[col.key] }}
                </template>
              </template>
            </td>
            <td class="text-right">
              <template v-if="actions.length">
                <div class="btn-group">
                  <router-link
                    v-if="hasAction('View') && actionTo('View', item)"
                    :to="actionTo('View', item)!"
                    custom
                    v-slot="{ navigate }"
                  >
                    <button @click="navigate" class="btn btn-info btn-sm mr-1">
                      <font-awesome-icon icon="eye"></font-awesome-icon>
                      <span class="d-none d-md-inline">{{ t$('entity.action.view') }}</span>
                    </button>
                  </router-link>
                  <router-link
                    v-if="hasAction('Update') && actionTo('Update', item)"
                    :to="actionTo('Update', item)!"
                    custom
                    v-slot="{ navigate }"
                  >
                    <button @click="navigate" class="btn btn-primary btn-sm mr-1">
                      <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                      <span class="d-none d-md-inline">{{ t$('entity.action.edit') }}</span>
                    </button>
                  </router-link>
                  <button v-if="hasAction('Delete')" class="btn btn-sm btn-danger mr-1" @click="prepareRemove(item)" v-b-modal.removeEntity>
                    <font-awesome-icon icon="times"></font-awesome-icon>
                    <span class="d-none d-md-inline">{{ t$('entity.action.delete') }}</span>
                  </button>
                </div>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <b-modal ref="removeEntity" id="removeEntity">
      <template #modal-title>
        <span>{{ t$('entity.delete.title') }}</span>
      </template>
      <div class="modal-body">
        <p>{{ t$('entity.delete.question', { id: removeId }) }}</p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" @click="closeDialog()">{{ t$('entity.action.cancel') }}</button>
          <button type="button" class="btn btn-primary" @click="removeItem()">{{ t$('entity.action.delete') }}</button>
        </div>
      </template>
    </b-modal>
    <div v-show="items && items.length > 0">
      <div class="row justify-content-center">
        <jhi-item-count :page="page" :total="queryCount" :itemsPerPage="itemsPerPage"></jhi-item-count>
      </div>
      <div class="row justify-content-center">
        <b-pagination size="md" :total-rows="totalItems" v-model="page" :per-page="itemsPerPage"></b-pagination>
      </div>
    </div>
  </div>
</template>
