<script setup lang="ts">
import { computed, onMounted, ref, watch, defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import { debounce } from 'lodash';
import type { CrudTableActionType, CrudTableEntity, CrudTableService } from './crud-table-interface';

const { t: t$ } = useI18n();

const props = defineProps<{
  title: string;
  entity: CrudTableEntity<any>;
  service: CrudTableService<any>;
}>();

const itemsPerPage = ref(20);
const queryCount = ref(0);
const page = ref(1);
const propOrder = ref<string>('id');
const reverse = ref(false);
const totalItems = ref(0);
const searchText = ref('');
const items = ref<any[]>([]);
const isFetching = ref(false);

const clear = () => {
  page.value = 1;
};

const sort = (): Array<any> => {
  const result = [`${propOrder.value},${reverse.value ? 'desc' : 'asc'}`];
  if (propOrder.value !== 'id') result.push('id');
  return result;
};

const retrieveItems = async () => {
  isFetching.value = true;
  try {
    const paginationQuery =
      searchText.value === ''
        ? { page: page.value - 1, size: itemsPerPage.value, sort: sort() }
        : { page: page.value - 1, size: itemsPerPage.value, globalSearch: searchText.value, sort: sort() };

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

const removeId = ref<number | string | null>(null);
const removeEntity = ref<any>(null);
const removeInstance = ref<any | null>(null);

const prepareRemove = (instance: any) => {
  removeId.value = instance?.id ?? null;
  removeInstance.value = instance ?? null;
  removeEntity.value?.show?.();
};

const removeItemLabel = computed(() => {
  const instance = removeInstance.value;
  if (!instance) return removeId.value ?? '';

  const fn = props.entity.deleteItemLabel;
  if (typeof fn === 'function') {
    try {
      return fn(instance) ?? '';
    } catch (e) {
      console.warn('deleteItemLabel lanzó un error, usando id como fallback', e);
    }
  }

  return instance.id ?? '';
});

const closeDialog = () => {
  removeEntity.value?.hide?.();
};

const removeItem = async () => {
  if (removeId.value === null || removeId.value === undefined) return;

  try {
    await props.service.delete(removeId.value);
    removeId.value = null;
    removeInstance.value = null;
    await retrieveItems();
    closeDialog();
  } catch (error: any) {
    console.error(error);
  }
};

const changeOrder = (newOrder: string) => {
  if (propOrder.value === newOrder) reverse.value = !reverse.value;
  else reverse.value = false;
  propOrder.value = newOrder;
};

watch([propOrder, reverse], async () => {
  if (page.value === 1) await retrieveItems();
  else clear();
});

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
      <span>{{ props.title ?? '' }}</span>
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
      <span>{{ t$(props.entity.notFound) }}</span>
    </div>

    <div class="table-responsive" v-if="items && items.length > 0">
      <table class="table table-striped">
        <thead>
          <tr>
            <th v-for="col in props.entity.columns" :key="col.key" @click="col.sortable ? changeOrder(col.key) : null">
              <span>{{ t$(col.label) }}</span>
              <jhi-sort-indicator
                v-if="col.sortable"
                :current-order="propOrder"
                :reverse="reverse"
                :field-name="col.key"
              ></jhi-sort-indicator>
            </th>
            <th v-if="actions.length" scope="col" class="text-right">{{ t$('entity.action.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td v-for="col in props.entity.columns" :key="col.key">
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
                <b-dropdown variant="link" toggle-class="text-decoration-none" no-caret right size="sm">
                  <template #button-content>
                    <font-awesome-icon icon="ellipsis-v" />
                  </template>

                  <b-dropdown-item v-if="hasAction('View') && actionTo('View', item)" :to="actionTo('View', item)!">
                    <font-awesome-icon icon="eye" class="mr-1 text-secondary" />
                    {{ t$('entity.action.view') }}
                  </b-dropdown-item>

                  <b-dropdown-divider v-if="hasAction('View')" />

                  <b-dropdown-item v-if="hasAction('Update') && actionTo('Update', item)" :to="actionTo('Update', item)!">
                    <font-awesome-icon icon="pencil-alt" class="mr-1 text-warning" />
                    {{ t$('entity.action.edit') }}
                  </b-dropdown-item>

                  <b-dropdown-divider v-if="hasAction('Delete')" />

                  <b-dropdown-item v-if="hasAction('Delete')" @click="prepareRemove(item)" v-b-modal.removeEntity class="text-danger">
                    <font-awesome-icon icon="times" class="mr-1 text-danger" />
                    {{ t$('entity.action.delete') }}
                  </b-dropdown-item>

                  <b-dropdown-divider v-if="hasAction('Custom')" />

                  <b-dropdown-item v-if="hasAction('Custom') && actionTo('Custom', item)" :to="actionTo('Custom', item)!">
                    <font-awesome-icon icon="pencil-alt" class="mr-1" />
                    {{ t$('entity.action.edit') }}
                  </b-dropdown-item>
                </b-dropdown>
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
        <p v-if="props.entity.deleteMessage">
          {{ t$(props.entity.deleteMessage, { id: props.entity.deleteItemLabel ? removeItemLabel : removeId }) }}
        </p>
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
