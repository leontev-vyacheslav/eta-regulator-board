import devices from 'devextreme/core/devices';
import notify from 'devextreme/ui/notify';


export function proclaim(options: any) {
    notify({
        ...options,
        width: devices.current().phone ? '90%' : undefined,
        position: devices.current().phone ? 'bottom center' : {
            at: 'bottom right',
            my: 'bottom right',
            offset: '-20 -20'
        }
    }, {
        direction: 'up-stack'
    });
}