from matplotlib.patches import Ellipse, Circle
import numpy as np

def draw_geo_ellipse(ax, coords, color, label):
    # Invertimos columnas para que coincidan con el scatter (lon, lat)
    coords = coords[:, [1, 0]]  # lon en eje X, lat en eje Y
    
    if coords.shape[0] < 3:
        # Dibujar un círculo simple
        center = np.mean(coords, axis=0)
        if coords.shape[0] == 1:
            radius = 0.5  # radio fijo pequeño si hay un solo punto
        else:
            # distancia máxima entre los dos puntos como radio aproximado
            radius = np.linalg.norm(coords[0] - coords[1]) / 1.8

        circle = Circle(center, radius=radius,
                        edgecolor=color, facecolor=color, alpha=0.2, linewidth=2)
        ax.add_patch(circle)
        ax.scatter(coords[:, 0], coords[:, 1], color=color, s=50, label=label)
        return

    # Elipse basada en la covarianza
    cov = np.cov(coords, rowvar=False) * 4
    mean = np.mean(coords, axis=0)

    eigvals, eigvecs = np.linalg.eigh(cov)
    order = eigvals.argsort()[::-1]
    eigvals, eigvecs = eigvals[order], eigvecs[:, order]

    angle = np.degrees(np.arctan2(*eigvecs[:,0][::-1]))
    width, height = 2 * np.sqrt(eigvals)  # 1σ

    ellipse = Ellipse(xy=mean, width=width, height=height, angle=angle,
                      edgecolor=color, facecolor=color, alpha=0.2, linewidth=2)
    ax.add_patch(ellipse)
    ax.scatter(coords[:, 0], coords[:, 1], color=color, s=50, label=label)

def draw_center(ax,coords,color,cluster_id):

    center_lat = coords[:, 0].mean()
    center_lon = coords[:, 1].mean()
    ax.scatter(center_lon, center_lat, s=600, marker='X', edgecolor='black', linewidths=2,color=color)
    ax.text(center_lon, center_lat, f'C{cluster_id}', fontsize=12, ha='center', va='center', color='black', weight='bold')
