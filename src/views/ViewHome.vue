<script setup>
import { useApi } from "@composables/useApi";
import { FilterMatchMode } from "primevue/api";
import { reactive, ref, watch, computed } from "vue";

const appApi = reactive(useApi());

const dt = ref();
const listProductos = ref([]);
const selectedProduct = ref();
const loading = ref(true);
const modalMaterial = ref(false);
const formMaterial = reactive({
  id: null,
  clave: "",
  descripcion: "",
  precio: "",
  cantidad: 0,
  costo: 0,
});
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const submitted = ref(false);

const initComponents = () => {
  fetchListMaterial();
};

const fetchListMaterial = async () => {
  listProductos.value = await appApi.getMaterialList();
  loading.value = false;
};

const formatCurrency = (value) => {
  return value.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
};

const onRowUpdateMaterial = async (event) => {
  let { newData, index } = event;

  newData.costo = newData.precio / newData.cantidad;
  listProductos.value[index] = newData;

  appApi.updateMaterial(newData.id, newData);
};

const showModalNewMaterial = () => {
  resetFormModal();
  submitted.value = false;
  modalMaterial.value = true;
};

const showModalEditMaterial = (item) => {
  formMaterial.id = item.id;
  formMaterial.clave = item.clave;
  formMaterial.descripcion = item.descripcion;
  formMaterial.precio = item.precio;
  formMaterial.cantidad = item.cantidad;
  formMaterial.costo = item.costo;
  modalMaterial.value = true;
};

const hideModalMaterial = () => {
  modalMaterial.value = false;
  submitted.value = false;
};

const saveMaterial = async () => {
  submitted.value = true;

  formMaterial.costo = formMaterial.precio / formMaterial.cantidad;

  if (formMaterial.id != null) {
    await appApi.updateMaterial(formMaterial.id, formMaterial);
    
    listProductos.value[findIndexById(formMaterial.id)] = formMaterial;
  } else {
    formMaterial.id = getNewID();

    await appApi.addMaterial(formMaterial);
    listProductos.value.push({ ...formMaterial });
  }
  modalMaterial.value = false;
  resetFormModal();
};

const getNewID = () => {
  const materialMayor = listProductos.value.reduce((previous, current) => {
    return parseInt(current.id) > parseInt(previous.id) ? current : previous;
  });

  return parseInt(materialMayor.id) + 1;
};

const confirmDeleteMaterial = () => {};

const exportCSV = () => {
  dt.value.exportCSV();
};

const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < listProductos.value.length; i++) {
        if (listProductos.value[i].id == id) {
            index = i;
            break;
        }
    }
    return index;
};

const resetFormModal = () => {
  formMaterial.id = null;
  formMaterial.clave = "";
  formMaterial.descripcion = "";
  formMaterial.precio = 0.0;
  formMaterial.cantidad = 0;
  formMaterial.costo = 0.0;
};

initComponents();
</script>

<template>
  <Toolbar class="mb-4">
    <template #start>
      <Button
        label="Nuevo Material"
        icon="pi pi-plus"
        severity="success"
        class="mr-2"
        @click="showModalNewMaterial"
      />
    </template>
    <template #end>
      <Button
        label="Exportar"
        icon="pi pi-upload"
        severity="help"
        @click="exportCSV($event)"
      />
    </template>
  </Toolbar>
  <DataTable
    ref="dt"
    v-model:selection="selectedProduct"
    v-model:filters="filters"
    :value="listProductos"
    stripedRows
    removableSort
    :globalFilterFields="[
      'clave',
      'descripcion',
      'precio',
      'cantidad',
      'costo',
    ]"
    :loading="loading"
    dataKey="id"
    tableStyle="min-width: 50rem"
  >
    <template #header>
      <div class="flex justify-content-end">
        <span class="p-input-icon-left">
          <i class="pi pi-search" />
          <InputText
            v-model="filters['global'].value"
            placeholder="Buscar material"
          />
        </span>
      </div>
    </template>
    <template #empty> No customers found. </template>
    <template #loading> Loading customers data. Please wait. </template>
    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
    <Column field="id" sortable header="ID"></Column>
    <Column field="clave" sortable header="Clave"></Column>
    <Column field="descripcion" header="Descripción"></Column>
    <Column field="precio" sortable header="precio">
      <template #body="slotProps">
        {{ formatCurrency(slotProps.data.precio) }}
      </template>
    </Column>
    <Column field="cantidad" header="Cantidad"></Column>
    <Column field="costo" sortable header="Costo">
      <template #body="slotProps">
        {{ formatCurrency(slotProps.data.costo) }}
      </template></Column
    >
    <Column :exportable="false" style="min-width: 8rem">
      <template #body="slotProps">
        <Button
          icon="pi pi-pencil"
          outlined
          rounded
          class="mr-2"
          @click="showModalEditMaterial(slotProps.data)"
        />
        <Button
          icon="pi pi-trash"
          outlined
          rounded
          severity="danger"
          @click="confirmDeleteMaterial(slotProps.data)"
        />
      </template>
    </Column>
  </DataTable>
  <Dialog
    v-model:visible="modalMaterial"
    :style="{ width: '450px' }"
    header="Material Detalles"
    :modal="true"
    class="p-fluid"
  >
    <div class="field">
      <label for="clave">Clave</label>
      <InputText
        id="clave"
        v-model.trim="formMaterial.clave"
        required="true"
        autofocus
        :class="{ 'p-invalid': submitted && !formMaterial.clave }"
      />
      <small class="p-error" v-if="submitted && !formMaterial.clave"
        >Clave es requerida.</small
      >
    </div>
    <div class="field">
      <label for="descripcion">Descripcion</label>
      <Textarea
        id="descripcion"
        v-model="formMaterial.descripcion"
        required="true"
        rows="3"
        cols="20"
      />
    </div>

    <div class="formgrid grid">
      <div class="field col">
        <label for="precio">Precio</label>
        <InputNumber
          id="precio"
          v-model="formMaterial.precio"
          mode="currency"
          currency="MXN"
          locale="es-MX"
        />
      </div>
      <div class="field col">
        <label for="cantidad">Cantidad</label>
        <InputNumber
          id="cantidad"
          v-model="formMaterial.cantidad"
          integeronly
        />
      </div>
    </div>
    <template #footer>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        text
        @click="hideModalMaterial"
      />
      <Button label="Guardar" icon="pi pi-check" text @click="saveMaterial()" />
    </template>
  </Dialog>
</template>
