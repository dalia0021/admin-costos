<script setup>
import { useApi } from "@composables/useApi";
import { FilterMatchMode } from 'primevue/api';
import { reactive, ref, watch, computed } from "vue";

const appApi = reactive(useApi());

const listProductos = ref([]);
const selectedProduct = ref();
const loading = ref(true);
const editingRows = ref([]);

const initComponents = () => {
    fetchListProducts();
};

const fetchListProducts = async () => {
    listProductos.value = await appApi.getProductsList()
    loading.value = false;

};

const formatCurrency = (value) => {
    return value.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
    });
};

const onRowEditSave = (event) => {
    let { newData, index } = event;

    listProductos.value[index] = newData;

    appApi.editProductList(listProductos.value)    
};

const calculateCosto = (precio, cantidad) => {
    let costo = precio / cantidad;
    return costo.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
    });
};

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

initComponents();
</script>

<template>
    <DataTable
        v-model:selection="selectedProduct"
        v-model:filters="filters"
        v-model:editingRows="editingRows"
        :value="listProductos"
        editMode="row"
        stripedRows
        removableSort
        :globalFilterFields="['clave', 'descripcion', 'precio', 'cantidad']"
        :loading="loading" 
        dataKey="id"
        tableStyle="min-width: 50rem"
        @row-edit-save="onRowEditSave"
        >
    
        <template #header>
            <div class="flex justify-content-end">
                <span class="p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText
                        v-model="filters['global'].value"
                        placeholder="Keyword Search"
                    />
                </span>
            </div>
        </template>
        <template #empty> No customers found. </template>
        <template #loading> Loading customers data. Please wait. </template>
        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
        <Column field="clave" sortable header="Clave"></Column>
        <Column field="descripcion" header="Descripción"></Column>
        <Column field="precio" sortable header="precio">
            <template #editor="{ data, field }">
                <InputText v-model="data[field]" />
            </template>
            <template #body="slotProps">
                {{ formatCurrency(slotProps.data.precio) }}
            </template>
        </Column>
        <Column field="cantidad" header="Cantidad">
            <template #editor="{ data, field }">
                    <InputText v-model="data[field]" />
                </template>
        </Column>
        <Column field="costo" header="Costo">
            <template #body="slotProps">
                {{
                    calculateCosto(
                        slotProps.data.precio,
                        slotProps.data.cantidad
                    )
                }}
            </template></Column
        >
        <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>
    </DataTable>
</template>
