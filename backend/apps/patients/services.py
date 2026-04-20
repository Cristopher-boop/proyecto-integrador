from .models import Paciente

class PacienteService:
    @staticmethod
    def obtener_activos():
        """Solo retorna pacientes que no han sido borrados lógicamente."""
        return Paciente.objects.filter(esta_activo=True)

    @staticmethod
    def crear_paciente(datos_validados):
        return Paciente.objects.create(**datos_validados)

    @staticmethod
    def obtener_por_id(id_paciente):
        try:
            return Paciente.objects.get(id_paciente=id_paciente, esta_activo=True)
        except Paciente.DoesNotExist:
            return None

    @staticmethod
    def actualizar_paciente(paciente, datos_validados):
        for campo, valor in datos_validados.items():
            setattr(paciente, campo, valor)
        paciente.save()
        return paciente

    @staticmethod
    def baja_logica(paciente):
        """Realiza la baja lógica del paciente y sus dependencias."""
        paciente.esta_activo = False
        paciente.save()
        # Aquí podrías agregar: paciente.admisiones.update(esta_activo=False)
        return True
    
    @staticmethod
    def reactivar_paciente(id_paciente):
        """Reactiva un paciente que estaba dado de baja lógica."""
        try:
            # Buscamos explícitamente un paciente que esté INACTIVO
            paciente = Paciente.objects.get(id_paciente=id_paciente, esta_activo=False)
            paciente.esta_activo = True
            paciente.save()
            return paciente
        except Paciente.DoesNotExist:
            return None