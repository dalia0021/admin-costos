<script setup>
import { useApi } from "@composables/useApi";
import { FilterMatchMode } from "primevue/api";
import { reactive, ref, watch, computed } from "vue";

const appApi = reactive(useApi());

const listMateriales = ref([]);
const formMaterial = reactive({
    id: null,
    clave: "",
    descripcion: "",
    unidad: "pza",
    precio: "",
    cantidad: 0,
    costo: 0,
    status: "instock",
});

const selectedMateriales = ref();
const loading = ref(true);
const submitted = ref(false);

const dt = ref();
const modalMaterial = ref(false);
const modalMaterialCosto = ref(false);

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const statuses = ref([
    { label: "INSTOCK", value: "instock" },
    { label: "LOWSTOCK", value: "lowstock" },
    { label: "OUTOFSTOCK", value: "outofstock" },
]);

const totalCostoSelectedMateriales = computed(()=>{
    return selectedMateriales.value.reduce((total, item) => {
        return total + item.cantidad * item.costo
    }, 0);
})

const initComponents = () => {
    fetchListMaterial();
};

const fetchListMaterial = async () => {
    listMateriales.value = await appApi.getMaterialList();
    loading.value = false;
};

const formatCurrency = (value) => {
    return value.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
    });
};

const showModalNewMaterial = () => {
    resetFormModal();
    submitted.value = false;
    modalMaterial.value = true;
};

const showModalMaterialCosto = () => {
    selectedMateriales.value.forEach(item => {
        item.cantidad = 1;
    });
    modalMaterialCosto.value = true;
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

        listMateriales.value[findIndexById(formMaterial.id)] = {
            ...formMaterial,
        };
    } else {
        formMaterial.id = getNewID();

        await appApi.addMaterial(formMaterial);
        listMateriales.value.push({ ...formMaterial });
    }
    modalMaterial.value = false;
    resetFormModal();
};

const getNewID = () => {
    const materialMayor = listMateriales.value.reduce((previous, current) => {
        return parseInt(current.id) > parseInt(previous.id)
            ? current
            : previous;
    });

    return parseInt(materialMayor.id) + 1;
};

const confirmDeleteMaterial = () => {};

const exportCSV = () => {
    dt.value.exportCSV();
};

const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < listMateriales.value.length; i++) {
        if (listProductos.value[i].id == id) {
            index = i;
            break;
        }
    }
    return index;
};

const getStatusLabel = (status) => {
    switch (status) {
        case "INSTOCK":
            return "success";

        case "LOWSTOCK":
            return "warning";

        case "OUTOFSTOCK":
            return "danger";

        default:
            return null;
    }
};

const resetFormModal = () => {
    formMaterial.id = null;
    formMaterial.clave = "";
    formMaterial.descripcion = "";
    formMaterial.precio = 0.0;
    formMaterial.cantidad = 0;
    formMaterial.costo = 0.0;
    formMaterial.unidad = "pza"
    formMaterial.status = "instock";
};

initComponents();
</script>

<template>
    <Toolbar class="mb-4">
        <template #start>
            <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText
                    v-model="filters['global'].value"
                    placeholder="Buscar material"
                />
            </span>
        </template>
        <template #end>
            <Button
                label="Nuevo material"
                icon="pi pi-plus"
                severity="success"
                class="mr-2"
                @click="showModalNewMaterial"
            />
            <Button
                label="Calcular costo"
                icon="pi pi-calculator"
                severity="primary"
                class="mr-2"
                @click="showModalMaterialCosto"
            />
            <Button
                label="Exportar"
                icon="pi pi-upload"
                severity="secondary"
                @click="exportCSV($event)"
            />
        </template>
    </Toolbar>
    <DataTable
        ref="dt"
        v-model:selection="selectedMateriales"
        v-model:filters="filters"
        :value="listMateriales"
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
        <template #empty> No se encontraron materiales. </template>
        <template #loading> Cargando materiales. </template>
        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
        <Column field="clave" sortable header="Clave"></Column>
        <Column field="descripcion" header="Descripción"></Column>
        <Column field="precio" sortable header="Precio">
            <template #body="slotProps">
                {{ formatCurrency(slotProps.data.precio) }}
            </template>
        </Column>
        <Column field="cantidad" header="Cantidad">
            <template #body="slotProps">
                {{ slotProps.data.cantidad }}
                <small>{{ slotProps.data.unidad }}</small>
            </template>
        </Column>
        <Column field="costo" sortable header="Costo">
            <template #body="slotProps">
                <b class="text-primary">{{ formatCurrency(slotProps.data.costo) }}</b>
            </template></Column
        >
        <Column
            field="status"
            header="Status"
            sortable
            style="min-width: 12rem"
        >
            <template #body="slotProps">
                <Tag
                    :value="slotProps.data.status"
                    :severity="getStatusLabel(slotProps.data.status)"
                />
            </template>
        </Column>
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

        <div class="field">
            <label for="inventoryStatus" class="mb-3">Status Inventario</label>
            <Dropdown
                id="inventoryStatus"
                v-model="formMaterial.status"
                :options="statuses"
                optionLabel="label"
                placeholder="Seleccionar status"
            >
                <template #value="slotProps">
                    <div v-if="slotProps.value && slotProps.value.value">
                        <Tag
                            :value="slotProps.value.value"
                            :severity="getStatusLabel(slotProps.value.label)"
                        />
                    </div>
                    <div v-else-if="slotProps.value && !slotProps.value.value">
                        <Tag
                            :value="slotProps.value"
                            :severity="getStatusLabel(slotProps.value)"
                        />
                    </div>
                    <span v-else>
                        {{ slotProps.placeholder }}
                    </span>
                </template>
            </Dropdown>
        </div>
        <div class="field">
            <label class="mb-3">Unidad de medida</label>
            <div class="formgrid grid">
                <div class="field-radiobutton col-6">
                    <RadioButton
                        id="unidad1"
                        name="unidad"
                        value="pza"
                        v-model="formMaterial.unidad"
                    />
                    <label for="unidad1">Pieza</label>
                </div>
                <div class="field-radiobutton col-6">
                    <RadioButton
                        id="unidad2"
                        name="unidad"
                        value="cm"
                        v-model="formMaterial.unidad"
                    />
                    <label for="unidad2">Centimetro</label>
                </div>
                <div class="field-radiobutton col-6">
                    <RadioButton
                        id="unidad3"
                        name="unidad"
                        value="ml"
                        v-model="formMaterial.unidad"
                    />
                    <label for="unidad3">Mililitro</label>
                </div>
                <div class="field-radiobutton col-6">
                    <RadioButton
                        id="unidad4"
                        name="unidad"
                        value="gm"
                        v-model="formMaterial.unidad"
                    />
                    <label for="unidad4">Gramos</label>
                </div>
            </div>
        </div>

        <div class="formgrid grid">
            <div class="field col">
                <label for="precio">Precio</label>
                <InputNumber
                    id="precio"
                    v-model="formMaterial.precio"
                    required="true"
                    mode="currency"
                    currency="MXN"
                    locale="es-MX"
                />
            </div>
            <div class="field col">
                <label for="cantidad">Cantidad</label>
                <InputNumber
                    id="cantidad"
                    required="true"
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
            <Button
                label="Guardar"
                icon="pi pi-check"
                text
                @click="saveMaterial()"
            />
        </template>
    </Dialog>
    <Dialog
        v-model:visible="modalMaterialCosto"
        :style="{ width: '600px' }"
        header="Calcular costos"
        :modal="true"
        class="p-fluid"
    >

    <DataView :value="selectedMateriales">
            <template #list="slotProps">
                <div class="grid grid-nogutter">
                    <div v-for="(item, index) in slotProps.items" :key="index" class="col-12">
                        <div class="flex flex-row align-items-center p-2 gap-3" :class="{ 'border-top-1 surface-border': index !== 0 }">
                            <div class="flex flex-row justify-content-between align-items-center gap-3 flex-1">
                                <div class="flex flex-row align-items-center">
                                    <div class="flex flex-column mr-2">
                                        <Button icon="pi pi-angle-up" @click="item.cantidad += 1" text rounded />
                                        <Button icon="pi pi-angle-down" @click="item.cantidad -= 1" text rounded />
                                    </div>
                                    <div class="flex flex-row justify-content-between align-items-start">
                                        
                                        <div>
                                            <span class="text-lg font-medium text-900">{{ item.clave }}</span>
                                            <div class="font-medium text-secondary text-sm mt-2">{{ item.descripcion }}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex flex-column align-items-end">
                                    <span class="text-900 font-medium text-sm"> {{ item.cantidad }} x ${{ item.costo }}</span>
                                    <span class="text-xl font-semibold text-900 mt-2">${{ item.costo * item.cantidad }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </DataView>
        <div class="flex justify-content-between flex-wrap border-top-1 surface-border p-2">
            <div class="flex align-items-center justify-content-center mt-2 mr-2">
                <span class="text-lg font-medium text-900">Total costo materiales:</span>
            </div>
            <div class="flex align-items-center justify-content-center mt-2">
                <span class="text-xl font-semibold text-primary">{{ formatCurrency(totalCostoSelectedMateriales) }}</span>
            </div>
        </div>
       



        <template #footer>
            <Button
                label="Cerrar"
                icon="pi pi-times"
                text
                @click="modalMaterialCosto = false"
            />
        </template>
    </Dialog>
</template>
